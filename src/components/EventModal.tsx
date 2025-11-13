import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCountdown from "./EventCountdown";
import EventGallery from "./EventGallery";
import RegistrationForm from "./RegistrationForm";
import EventPlayers from "./EventPlayers";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState as useAuthState, useEffect as useAuthEffect } from "react";

interface Event {
  id: string;
  title: string;
  description?: string;
  detailed_description?: string;
  players_count?: string;
  event_date?: string;
  status: string;
  organizer?: string;
  image_url?: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal = ({ event, isOpen, onClose }: EventModalProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useAuthEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    if (event && isOpen) {
      loadGallery();
    }
  }, [event, isOpen]);

  const loadGallery = async () => {
    if (!event) return;
    
    setIsLoadingGallery(true);
    try {
      const { data, error } = await supabase
        .from("event_gallery")
        .select("*")
        .eq("event_id", event.id)
        .order("display_order");

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "text-primary";
      case "ongoing":
        return "text-green-400";
      case "completed":
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Próximamente";
      case "ongoing":
        return "En Progreso";
      case "completed":
        return "Finalizado";
      default:
        return "";
    }
  };

  if (!event) return null;

  const eventDate = event.event_date ? new Date(event.event_date) : null;
  const isUpcoming = event.status === "upcoming" && eventDate && eventDate > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Hero Image */}
        {event.image_url && (
          <div className="relative h-64 md:h-80 -mx-6 -mt-4 mb-6 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold border ${
                  event.status === "upcoming"
                    ? "bg-primary/20 text-primary border-primary/50"
                    : event.status === "ongoing"
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-muted/50 text-muted-foreground border-muted"
                }`}
              >
                {getStatusText(event.status)}
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="register" disabled={event.status === "completed"}>
              Registro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Countdown */}
            {isUpcoming && eventDate && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Comienza en:</h3>
                <EventCountdown targetDate={eventDate} />
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {event.players_count && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Jugadores</p>
                    <p className="text-lg font-bold">{event.players_count}</p>
                  </div>
                )}
                {eventDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="text-lg font-bold">
                      {eventDate.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {event.organizer && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Organizado por</p>
                  <p className="text-lg font-bold text-primary">{event.organizer}</p>
                </div>
              )}

              {event.detailed_description && (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.detailed_description}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            {isLoadingGallery ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : galleryImages.length > 0 ? (
              <EventGallery images={galleryImages} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay imágenes disponibles para este evento</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            {event.status === "upcoming" ? (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <h3 className="text-xl font-bold mb-4">Inicia sesión para registrarte</h3>
                    <p className="text-muted-foreground mb-6">
                      Necesitas tener una cuenta para registrarte en eventos.
                    </p>
                    <Button onClick={() => navigate("/auth")}>
                      Ir a iniciar sesión
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h3 className="text-lg font-bold mb-2">Registro para {event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Completa el formulario para registrarte en este evento.
                      </p>
                    </div>
                    <RegistrationForm
                      eventId={event.id}
                      eventTitle={event.title}
                      onSuccess={() => {
                        setTimeout(() => onClose(), 2000);
                      }}
                    />
                  </>
                )}
                
                <div className="mt-8">
                  <EventPlayers eventId={event.id} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>El registro no está disponible para este evento</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;

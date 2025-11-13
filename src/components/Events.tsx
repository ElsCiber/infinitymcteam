import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import EventModal from "./EventModal";

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
  featured?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEventModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/50";
      case "ongoing":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "completed":
        return "bg-muted/50 text-muted-foreground border-muted";
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

  if (isLoading) {
    return (
      <section id="events" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card to-background"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="events" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card to-background"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              Nuestros <span className="text-primary">Eventos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experiencias únicas diseñadas para la comunidad de Minecraft
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group relative overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
                onClick={() => openEventModal(event)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  {event.players_count && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">👥</span>
                      {event.players_count}
                    </p>
                  )}
                  
                  {event.event_date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">📅</span>
                      {new Date(event.event_date).toLocaleDateString("es-ES")}
                    </p>
                  )}
                  
                  {event.organizer && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">⚡</span>
                      {event.organizer}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Events;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Trash2, Calendar, Users, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Registration {
  id: string;
  player_name: string;
  minecraft_username: string;
  created_at: string;
  event_id: string;
  events: {
    title: string;
    event_date: string;
    image_url: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      loadRegistrations(session.user.id);
    } catch (error: any) {
      toast.error("Error al verificar autenticación");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          player_name,
          minecraft_username,
          created_at,
          event_id,
          events (
            title,
            event_date,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error loading registrations:", error);
      toast.error("Error al cargar inscripciones");
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registrationId);

      if (error) throw error;

      toast.success("Inscripción cancelada exitosamente");
      if (user) {
        loadRegistrations(user.id);
      }
    } catch (error) {
      console.error("Error canceling registration:", error);
      toast.error("Error al cancelar inscripción");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-primary">Mi Perfil</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mis Inscripciones a Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes inscripciones activas
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <Card key={reg.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4">
                        {reg.events.image_url && (
                          <img
                            src={reg.events.image_url}
                            alt={reg.events.title}
                            className="w-full md:w-48 h-48 object-cover"
                          />
                        )}
                        <div className="flex-1 p-4 space-y-2">
                          <h3 className="text-xl font-bold">{reg.events.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(reg.events.event_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><strong>Nombre:</strong> {reg.player_name}</p>
                            <p><strong>Usuario Minecraft:</strong> @{reg.minecraft_username}</p>
                            <p className="text-muted-foreground">
                              Registrado el {new Date(reg.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 flex items-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancelar Inscripción
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto cancelará tu inscripción al evento "{reg.events.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelRegistration(reg.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

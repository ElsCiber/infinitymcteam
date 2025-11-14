import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Download, CheckCircle, XCircle, Pause } from "lucide-react";
import GalleryManager from "@/components/GalleryManager";
import DashboardStats from "@/components/DashboardStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    email: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  event_date: string;
  image_url: string;
  status: string;
  organizer: string;
  players_count: string;
  featured: boolean;
  registration_status?: string;
  max_participants?: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar_url: string;
  display_order: number;
  role_color: string;
}

interface Registration {
  id: string;
  player_name: string;
  player_email: string;
  minecraft_username: string;
  additional_info?: string;
  created_at: string;
  event_id: string;
  attended?: boolean;
  events?: {
    title: string;
  };
}

interface AuditLog {
  id: string;
  created_at: string;
  admin_email: string;
  target_email: string;
  action: string;
  old_role: string;
  new_role: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all");
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

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some((r) => r.role === "admin");
      
      if (!hasAdminRole) {
        toast.error("No tienes permisos de administrador");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadUsers();
      loadEvents();
      loadTeamMembers();
      loadRegistrations();
      loadAuditLogs();
    } catch (error: any) {
      toast.error("Error al verificar autenticación");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (error) throw error;

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email");

      const combined = rolesData?.map(role => ({
        ...role,
        profiles: { email: profilesData?.find(p => p.id === role.user_id)?.email || "N/A" }
      })) || [];

      setUsers(combined);
    } catch (error: any) {
      toast.error("Error al cargar usuarios");
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error("Error al cargar eventos");
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      toast.error("Error al cargar miembros del equipo");
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, events(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      toast.error("Error al cargar inscripciones");
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error: any) {
      toast.error("Error al cargar logs de auditoría");
    }
  };

  const createAuditLog = async (targetUserId: string, action: string, oldRole: string, newRole: string, targetEmail: string) => {
    try {
      await supabase.from("audit_logs").insert({
        admin_user_id: user?.id || null,
        target_user_id: targetUserId,
        action,
        old_role: oldRole as "admin" | "user",
        new_role: newRole as "admin" | "user",
        admin_email: user?.email || null,
        target_email: targetEmail,
      });
    } catch (error: any) {
      console.error("Error creating audit log:", error);
    }
  };

  const promoteToAdmin = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "admin") {
        toast.error("Este usuario ya es administrador");
        return;
      }

      const targetUser = users.find(u => u.user_id === userId);
      const targetEmail = (targetUser?.profiles as any)?.email || "N/A";

      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });

      if (error) throw error;

      await createAuditLog(userId, "promote_to_admin", currentRole, "admin", targetEmail);
      toast.success("Usuario promovido a administrador");
      loadUsers();
    } catch (error: any) {
      toast.error("Error al promover usuario: " + error.message);
    }
  };

  const demoteToUser = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "user") {
        toast.error("Este usuario ya es un usuario normal");
        return;
      }

      const targetUser = users.find(u => u.user_id === userId);
      const targetEmail = (targetUser?.profiles as any)?.email || "N/A";

      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "user" });

      if (error) throw error;

      await createAuditLog(userId, "demote_to_user", currentRole, "user", targetEmail);
      toast.success("Usuario degradado a usuario normal");
      loadUsers();
    } catch (error: any) {
      toast.error("Error al degradar usuario: " + error.message);
    }
  };

  const uploadImage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      let imageUrl = editingEvent?.image_url || "";
      const imageFile = (formData.get("image") as File);
      
      if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImage(imageFile, "events");
      }

      const eventData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        detailed_description: formData.get("detailed_description") as string,
        event_date: formData.get("event_date") as string,
        status: formData.get("status") as string,
        organizer: formData.get("organizer") as string,
        players_count: formData.get("players_count") as string,
        featured: formData.get("featured") === "on",
        image_url: imageUrl,
        max_participants: formData.get("max_participants") ? parseInt(formData.get("max_participants") as string) : null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);
        if (error) throw error;
        toast.success("Evento actualizado");
      } else {
        const { error } = await supabase
          .from("events")
          .insert(eventData);
        if (error) throw error;
        toast.success("Evento creado");
      }

      setIsEventDialogOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error: any) {
      toast.error("Error al guardar evento: " + error.message);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      let avatarUrl = editingTeamMember?.avatar_url || "";
      const avatarFile = (formData.get("avatar") as File);
      
      if (avatarFile && avatarFile.size > 0) {
        avatarUrl = await uploadImage(avatarFile, "team");
      }

      const teamData = {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        specialty: formData.get("specialty") as string,
        display_order: parseInt(formData.get("display_order") as string),
        avatar_url: avatarUrl,
        role_color: formData.get("role_color") as string,
      };

      if (editingTeamMember) {
        const { error } = await supabase
          .from("team_members")
          .update(teamData)
          .eq("id", editingTeamMember.id);
        if (error) throw error;
        toast.success("Miembro actualizado");
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert(teamData);
        if (error) throw error;
        toast.success("Miembro creado");
      }

      setIsTeamDialogOpen(false);
      setEditingTeamMember(null);
      loadTeamMembers();
    } catch (error: any) {
      toast.error("Error al guardar miembro: " + error.message);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Evento eliminado");
      loadEvents();
    } catch (error: any) {
      toast.error("Error al eliminar evento");
    }
  };

  const deleteTeamMember = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este miembro?")) return;
    
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
      toast.success("Miembro eliminado");
      loadTeamMembers();
    } catch (error: any) {
      toast.error("Error al eliminar miembro");
    }
  };

  const updateRegistrationStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ registration_status: status })
        .eq("id", eventId);

      if (error) throw error;

      // Si se abrieron las inscripciones, enviar notificaciones
      if (status === 'open') {
        const event = events.find(e => e.id === eventId);
        if (event) {
          await supabase.functions.invoke("send-event-notification", {
            body: {
              eventId: eventId,
              title: "¡Nuevas inscripciones abiertas!",
              message: `Las inscripciones para ${event.title} están ahora abiertas.`,
            },
          });
        }
      }

      toast.success(`Inscripciones ${status === 'open' ? 'abiertas' : status === 'closed' ? 'cerradas' : 'pausadas'}`);
      loadEvents();
    } catch (error: any) {
      toast.error("Error al actualizar estado de inscripciones");
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.player_name.toLowerCase().includes(registrationSearch.toLowerCase()) ||
      reg.player_email.toLowerCase().includes(registrationSearch.toLowerCase()) ||
      reg.minecraft_username.toLowerCase().includes(registrationSearch.toLowerCase());
    
    const matchesEvent = selectedEventFilter === "all" || reg.event_id === selectedEventFilter;
    
    return matchesSearch && matchesEvent;
  });

  const filteredAuditLogs = auditLogs.filter(log =>
    log.admin_email.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.target_email.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.action.toLowerCase().includes(auditSearch.toLowerCase())
  );

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Volver al Inicio
            </Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="registrations">Inscripciones</TabsTrigger>
            <TabsTrigger value="team">Equipo</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Estadísticas y Métricas</h2>
              <DashboardStats />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Usuarios Registrados</h2>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>ID de Usuario</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell>{(userRole.profiles as any)?.email || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            userRole.role === "admin" 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {userRole.role}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{userRole.user_id}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {userRole.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => promoteToAdmin(userRole.user_id, userRole.role)}
                              >
                                Promover a Admin
                              </Button>
                            )}
                            {userRole.role === "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => demoteToUser(userRole.user_id, userRole.role)}
                              >
                                Degradar a Usuario
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados todavía
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gestión de Eventos</h2>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingEvent(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingEvent ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" defaultValue={editingEvent?.title} required />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción corta</Label>
                        <Textarea id="description" name="description" defaultValue={editingEvent?.description} required />
                      </div>
                      <div>
                        <Label htmlFor="detailed_description">Descripción detallada</Label>
                        <Textarea id="detailed_description" name="detailed_description" defaultValue={editingEvent?.detailed_description} />
                      </div>
                      <div>
                        <Label htmlFor="event_date">Fecha del evento</Label>
                        <Input id="event_date" name="event_date" type="datetime-local" defaultValue={editingEvent?.event_date?.slice(0, 16)} required />
                      </div>
                      <div>
                        <Label htmlFor="organizer">Organizador</Label>
                        <Input id="organizer" name="organizer" defaultValue={editingEvent?.organizer} />
                      </div>
                      <div>
                        <Label htmlFor="players_count">Cantidad de jugadores</Label>
                        <Input id="players_count" name="players_count" defaultValue={editingEvent?.players_count} />
                      </div>
                      <div>
                        <Label htmlFor="max_participants">Límite de inscripciones</Label>
                        <Input 
                          id="max_participants" 
                          name="max_participants" 
                          type="number" 
                          min="1"
                          placeholder="Dejar vacío para sin límite"
                          defaultValue={editingEvent?.max_participants || ""} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Estado</Label>
                        <Input id="status" name="status" defaultValue={editingEvent?.status || "upcoming"} required />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="featured" name="featured" defaultChecked={editingEvent?.featured} />
                        <Label htmlFor="featured">Destacado</Label>
                      </div>
                      <div>
                        <Label htmlFor="image">Imagen</Label>
                        <Input id="image" name="image" type="file" accept="image/*" />
                        {editingEvent?.image_url && (
                          <img src={editingEvent.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                        )}
                      </div>
                      
                      {editingEvent && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-2">Gestión de Galería</h3>
                          <GalleryManager eventId={editingEvent.id} />
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full">Guardar</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Inscripciones</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={event.registration_status === 'open' ? 'default' : 'outline'}
                              onClick={() => updateRegistrationStatus(event.id, 'open')}
                              title="Abrir inscripciones"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={event.registration_status === 'paused' ? 'default' : 'outline'}
                              onClick={() => updateRegistrationStatus(event.id, 'paused')}
                              title="Pausar inscripciones"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={event.registration_status === 'closed' ? 'default' : 'outline'}
                              onClick={() => updateRegistrationStatus(event.id, 'closed')}
                              title="Cerrar inscripciones"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEvent(event);
                                setIsEventDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gestión del Equipo</h2>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTeamMember(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Miembro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingTeamMember ? "Editar Miembro" : "Nuevo Miembro"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTeamSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={editingTeamMember?.name} required />
                      </div>
                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Input id="role" name="role" defaultValue={editingTeamMember?.role} required />
                      </div>
                      <div>
                        <Label htmlFor="specialty">Especialidad</Label>
                        <Input id="specialty" name="specialty" defaultValue={editingTeamMember?.specialty} />
                      </div>
                      <div>
                        <Label htmlFor="role_color">Color del Rol</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="role_color" 
                            name="role_color" 
                            type="color" 
                            defaultValue={editingTeamMember?.role_color || '#ffffff'} 
                            className="w-20 h-10"
                          />
                          <Input 
                            type="text" 
                            defaultValue={editingTeamMember?.role_color || '#ffffff'} 
                            className="flex-1"
                            onChange={(e) => {
                              const colorInput = document.getElementById('role_color') as HTMLInputElement;
                              if (colorInput) colorInput.value = e.target.value;
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="display_order">Orden de visualización</Label>
                        <Input id="display_order" name="display_order" type="number" defaultValue={editingTeamMember?.display_order || 0} required />
                      </div>
                      <div>
                        <Label htmlFor="avatar">Avatar</Label>
                        <Input id="avatar" name="avatar" type="file" accept="image/*" />
                        {editingTeamMember?.avatar_url && (
                          <img src={editingTeamMember.avatar_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-full" />
                        )}
                      </div>
                      <Button type="submit" className="w-full">Guardar</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.specialty}</TableCell>
                        <TableCell>{member.display_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTeamMember(member);
                                setIsTeamDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTeamMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Inscripciones a Eventos</h2>
                <Button
                  onClick={() => exportToCSV(filteredRegistrations.map(r => ({
                    evento: (r.events as any)?.title || "N/A",
                    jugador: r.player_name,
                    email: r.player_email,
                    minecraft: r.minecraft_username,
                    fecha: new Date(r.created_at).toLocaleString('es-ES')
                  })), 'inscripciones')}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por nombre, email o usuario de Minecraft..."
                    value={registrationSearch}
                    onChange={(e) => setRegistrationSearch(e.target.value)}
                  />
                </div>
                <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtrar por evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                  <TableHead>Evento</TableHead>
                      <TableHead>Jugador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Usuario Minecraft</TableHead>
                      <TableHead>Asistió</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">
                          {(reg.events as any)?.title || "N/A"}
                        </TableCell>
                        <TableCell>{reg.player_name}</TableCell>
                        <TableCell>{reg.player_email}</TableCell>
                        <TableCell className="font-mono text-sm">
                          @{reg.minecraft_username}
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={reg.attended || false}
                            onChange={async (e) => {
                              try {
                                const { error } = await supabase
                                  .from("event_registrations")
                                  .update({ attended: e.target.checked })
                                  .eq("id", reg.id);
                                
                                if (error) throw error;
                                loadRegistrations();
                                toast.success(e.target.checked ? "Asistencia marcada" : "Asistencia desmarcada");
                              } catch (error: any) {
                                toast.error("Error al actualizar asistencia");
                              }
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(reg.created_at).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm("¿Eliminar esta inscripción?")) {
                                try {
                                  const { error } = await supabase
                                    .from("event_registrations")
                                    .delete()
                                    .eq("id", reg.id);
                                  
                                  if (error) throw error;
                                  toast.success("Inscripción eliminada");
                                  loadRegistrations();
                                } catch (error: any) {
                                  toast.error("Error al eliminar inscripción");
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredRegistrations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {registrationSearch || selectedEventFilter !== "all" 
                    ? "No se encontraron inscripciones con esos filtros" 
                    : "No hay inscripciones todavía"}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Historial de Auditoría</h2>
                  <p className="text-sm text-muted-foreground">
                    Registro de cambios de roles y acciones administrativas
                  </p>
                </div>
                <Button
                  onClick={() => exportToCSV(filteredAuditLogs.map(l => ({
                    fecha: new Date(l.created_at).toLocaleString('es-ES'),
                    admin: l.admin_email || "Sistema",
                    usuario_afectado: l.target_email,
                    accion: l.action,
                    rol_anterior: l.old_role,
                    rol_nuevo: l.new_role
                  })), 'auditoria')}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Buscar por email de admin, usuario o acción..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Usuario Afectado</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Cambio de Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.admin_email || "Sistema"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.target_email}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.action === "promote_to_admin" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {log.action === "promote_to_admin" ? "Promovido a Admin" : "Degradado a Usuario"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-muted-foreground">{log.old_role}</span>
                          {" → "}
                          <span className={log.new_role === "admin" ? "text-primary font-semibold" : ""}>
                            {log.new_role}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAuditLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {auditSearch ? "No se encontraron registros con esa búsqueda" : "No hay registros de auditoría todavía"}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

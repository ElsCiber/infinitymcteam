import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    email: string;
  };
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRole[]>([]);
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

      // Check if user is admin
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

      // Get profiles separately
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email");

      // Combine data
      const combined = rolesData?.map(role => ({
        ...role,
        profiles: { email: profilesData?.find(p => p.id === role.user_id)?.email || "N/A" }
      })) || [];

      setUsers(combined);
    } catch (error: any) {
      toast.error("Error al cargar usuarios");
    }
  };

  const promoteToAdmin = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "admin") {
        toast.error("Este usuario ya es administrador");
        return;
      }

      // Delete current role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (error) throw error;

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

      // Delete current role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Add user role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "user" });

      if (error) throw error;

      toast.success("Usuario degradado a usuario normal");
      loadUsers();
    } catch (error: any) {
      toast.error("Error al degradar usuario: " + error.message);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
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
      </div>
    </div>
  );
};

export default Admin;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetPassword) {
      // Handle password reset
      if (!email) {
        toast.error("Por favor ingresa tu email");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });

        if (error) throw error;

        toast.success("¡Revisa tu email para restablecer tu contraseña!");
        setIsResetPassword(false);
      } catch (error: any) {
        toast.error("Error al enviar email: " + error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Validate input
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Credenciales incorrectas");
          } else {
            toast.error("Error al iniciar sesión: " + error.message);
          }
        } else {
          toast.success("¡Bienvenido!");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email ya está registrado");
          } else {
            toast.error("Error al registrarse: " + error.message);
          }
        } else {
          toast.success("¡Cuenta creada exitosamente!");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error("Error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-primary">
            {isResetPassword ? "Recuperar Contraseña" : isLogin ? "Iniciar Sesión" : "Registrarse"}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {isResetPassword ? "Te enviaremos un email para restablecer tu contraseña" : isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </p>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {!isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Cargando..." : isResetPassword ? "Enviar Email" : isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isResetPassword && (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline block w-full"
                disabled={loading}
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            )}
            <button
              onClick={() => {
                setIsResetPassword(!isResetPassword);
                setPassword("");
              }}
              className="text-primary hover:underline block w-full"
              disabled={loading}
            >
              {isResetPassword
                ? "Volver al inicio de sesión"
                : "¿Olvidaste tu contraseña?"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
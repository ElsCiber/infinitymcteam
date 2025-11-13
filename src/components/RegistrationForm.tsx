import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  playerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  playerEmail: z.string().email("Email inválido").max(255),
  minecraftUsername: z.string().min(3, "El username debe tener al menos 3 caracteres").max(50),
  additionalInfo: z.string().max(1000).optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
  maxPlayers?: number;
}

const RegistrationForm = ({ eventId, eventTitle, onSuccess, maxPlayers }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      playerName: "",
      playerEmail: "",
      minecraftUsername: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Debes iniciar sesión",
          description: "Necesitas tener una cuenta para registrarte en eventos.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if event is full
      if (maxPlayers) {
        const { count } = await supabase
          .from("event_registrations")
          .select("*", { count: 'exact', head: true })
          .eq("event_id", eventId);

        if (count && count >= maxPlayers) {
          toast({
            title: "Evento lleno",
            description: "Lo sentimos, este evento ya alcanzó su capacidad máxima.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Check if user is already registered
      const { data: existingRegistration } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingRegistration) {
        toast({
          title: "Ya estás registrado",
          description: "Ya te has registrado en este evento.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert the registration with user_id
      const { error: insertError } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        player_name: values.playerName,
        player_email: values.playerEmail,
        minecraft_username: values.minecraftUsername,
        additional_info: values.additionalInfo || null,
      });

      if (insertError) throw insertError;

      // Then send the confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke(
          "send-registration-email",
          {
            body: {
              playerName: values.playerName,
              playerEmail: values.playerEmail,
              minecraftUsername: values.minecraftUsername,
              eventTitle: eventTitle,
              additionalInfo: values.additionalInfo,
            },
          }
        );

        if (emailError) {
          console.error("Error sending email:", emailError);
          // Don't throw - registration was successful even if email failed
        }
      } catch (emailError) {
        console.error("Email function error:", emailError);
        // Don't throw - registration was successful even if email failed
      }

      toast({
        title: "¡Registro exitoso!",
        description: `Te has registrado para ${eventTitle}. Te enviaremos más información por email.`,
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="playerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minecraftUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username de Minecraft</FormLabel>
              <FormControl>
                <Input placeholder="Tu username en Minecraft" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Información Adicional (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="¿Algo que quieras que sepamos?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrarse para el Evento"}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;

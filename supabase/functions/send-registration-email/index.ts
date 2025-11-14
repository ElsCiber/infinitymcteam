import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const registrationEmailSchema = z.object({
  playerName: z.string().min(2, "Player name too short").max(100, "Player name too long").regex(/^[a-zA-Z0-9\s\u00C0-\u017F]+$/, "Invalid characters in player name"),
  playerEmail: z.string().email("Invalid email").max(255, "Email too long"),
  minecraftUsername: z.string().min(3, "Minecraft username too short").max(16, "Minecraft username too long").regex(/^[a-zA-Z0-9_]+$/, "Invalid Minecraft username"),
  eventTitle: z.string().min(1, "Event title required").max(200, "Event title too long"),
  eventDate: z.string().optional(),
  additionalInfo: z.string().max(1000, "Additional info too long").optional(),
});

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

interface RegistrationEmailRequest {
  playerName: string;
  playerEmail: string;
  minecraftUsername: string;
  eventTitle: string;
  eventDate?: string;
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData: RegistrationEmailRequest = await req.json();

    // Validate input data
    const validationResult = registrationEmailSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid input data",
          details: validationResult.error.errors 
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const {
      playerName,
      playerEmail,
      minecraftUsername,
      eventTitle,
      eventDate,
      additionalInfo,
    } = validationResult.data;

    console.log("Sending registration email to:", playerEmail);

    // Escape all user inputs for HTML
    const safePlayerName = escapeHtml(playerName);
    const safeEventTitle = escapeHtml(eventTitle);
    const safeMinecraftUsername = escapeHtml(minecraftUsername);
    const safeAdditionalInfo = additionalInfo ? escapeHtml(additionalInfo) : null;

    // Format date safely if provided
    let formattedDate = '';
    if (eventDate) {
      try {
        formattedDate = new Date(eventDate).toLocaleString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error("Error formatting date:", e);
        formattedDate = eventDate;
      }
    }

    // Email to the player
    const playerEmailResponse = await resend.emails.send({
      from: "Infinity Team <onboarding@resend.dev>",
      to: [playerEmail],
      subject: `¡Registro Confirmado para ${safeEventTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d9ff; font-size: 32px; margin: 0;">Infinity Team</h1>
            <p style="color: #888; margin-top: 10px;">Eventos de Minecraft</p>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid #00d9ff;">
            <h2 style="color: #00d9ff; margin-top: 0;">¡Hola ${safePlayerName}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Tu registro para el evento <strong style="color: #00d9ff;">${safeEventTitle}</strong> ha sido confirmado exitosamente.
            </p>
            
            ${formattedDate ? `
              <div style="background-color: #0a0a0a; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #888;">Fecha del evento:</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #00d9ff; font-weight: bold;">
                  ${escapeHtml(formattedDate)}
                </p>
              </div>
            ` : ''}
            
            <div style="margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Username de Minecraft:</strong> ${safeMinecraftUsername}</p>
              ${safeAdditionalInfo ? `<p style="margin: 5px 0;"><strong>Información adicional:</strong> ${safeAdditionalInfo}</p>` : ''}
            </div>
            
            <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 20px;">
              <p style="font-size: 14px; color: #888; margin: 0;">
                Te enviaremos más detalles sobre el evento por email. ¡Nos vemos pronto!
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Infinity Team - Eventos de Minecraft
            </p>
          </div>
        </div>
      `,
    });

    console.log("Player email sent successfully:", playerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

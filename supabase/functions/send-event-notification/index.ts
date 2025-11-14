import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  eventId: string;
  title: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { eventId, title, message }: NotificationRequest = await req.json();

    console.log("Sending notifications for event:", eventId);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to notify" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create notifications for all users
    const notifications = users.map((user) => ({
      user_id: user.id,
      title,
      message,
      type: "event",
      event_id: eventId,
      read: false,
    }));

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
      throw notificationError;
    }

    console.log(`Successfully sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        count: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

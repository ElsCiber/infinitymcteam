import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { eventId, newRegistrationUserId } = await req.json();

    console.log('Checking capacity for event:', eventId);

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, max_participants')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      throw eventError;
    }

    if (!event.max_participants) {
      console.log('Event has no max_participants limit, skipping notification');
      return new Response(
        JSON.stringify({ message: 'No capacity limit set' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count current registrations
    const { count, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (countError) {
      console.error('Error counting registrations:', countError);
      throw countError;
    }

    const currentCount = count || 0;
    const remainingSpots = event.max_participants - currentCount;
    const percentageRemaining = (remainingSpots / event.max_participants) * 100;

    console.log(`Event: ${event.title}, Current: ${currentCount}, Max: ${event.max_participants}, Remaining: ${remainingSpots}`);

    // Only notify if 5 or fewer spots remain OR less than 20% capacity
    if (remainingSpots <= 5 || percentageRemaining <= 20) {
      console.log('Low capacity detected, sending notifications');

      // Get all users except the one who just registered
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', newRegistrationUserId);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      if (!users || users.length === 0) {
        console.log('No users to notify');
        return new Response(
          JSON.stringify({ message: 'No users to notify' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create notification message
      const message = remainingSpots <= 0 
        ? `¡El evento "${event.title}" está lleno!`
        : remainingSpots === 1
          ? `¡Último cupo disponible para "${event.title}"!`
          : `¡Solo quedan ${remainingSpots} cupos para "${event.title}"!`;

      // Insert notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        title: '⚠️ Últimos Cupos Disponibles',
        message: message,
        type: 'warning',
        event_id: eventId,
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        throw notificationError;
      }

      console.log(`Successfully created ${notifications.length} notifications`);

      return new Response(
        JSON.stringify({ 
          message: 'Notifications sent', 
          count: notifications.length,
          remainingSpots 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Capacity is still good, no notification needed');

    return new Response(
      JSON.stringify({ 
        message: 'Capacity OK',
        remainingSpots 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-low-capacity function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EventPlayersProps {
  eventId: string;
  maxPlayers?: number;
}

const EventPlayers = ({ eventId, maxPlayers }: EventPlayersProps) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayerCount();
    
    const channel = supabase
      .channel(`event-${eventId}-registrations`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          loadPlayerCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadPlayerCount = async () => {
    try {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: 'exact', head: true })
        .eq("event_id", eventId);

      if (error) throw error;
      setPlayerCount(count || 0);

      // Auto-close registration if max players reached
      if (maxPlayers && count && count >= maxPlayers) {
        await supabase
          .from("events")
          .update({ registration_status: 'closed' })
          .eq("id", eventId);
      }
    } catch (error) {
      console.error("Error loading player count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const isFull = maxPlayers ? playerCount >= maxPlayers : false;

  return (
    <Card className="p-6 text-center">
      <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">
          {playerCount} {maxPlayers ? `/ ${maxPlayers}` : ""}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isFull ? "¡Cupos completos!" : "Jugadores registrados"}
        </p>
      </div>
    </Card>
  );
};

export default EventPlayers;

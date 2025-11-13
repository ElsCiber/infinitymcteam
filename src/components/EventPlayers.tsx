import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Player {
  id: string;
  player_name: string;
  minecraft_username: string;
  created_at: string;
}

interface EventPlayersProps {
  eventId: string;
}

const EventPlayers = ({ eventId }: EventPlayersProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
    
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
          loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id, player_name, minecraft_username, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error loading players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aún no hay jugadores registrados</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Jugadores Registrados ({players.length})
        </h3>
      </div>
      <div className="grid gap-3">
        {players.map((player) => (
          <Card key={player.id} className="p-4 hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{player.player_name}</p>
                <p className="text-sm text-muted-foreground">
                  @{player.minecraft_username}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(player.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventPlayers;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface EventCounterProps {
  eventId: string;
  maxParticipants?: number;
}

const EventCounter = ({ eventId, maxParticipants }: EventCounterProps) => {
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCount();
    
    // Subscribe to realtime changes
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
          loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadCount = async () => {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: 'exact', head: true })
      .eq("event_id", eventId);

    setCurrentCount(count || 0);
    setIsLoading(false);
  };

  if (!maxParticipants) return null;

  const percentage = (currentCount / maxParticipants) * 100;
  const isFull = currentCount >= maxParticipants;
  const isAlmostFull = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium">
            {isLoading ? "..." : `${currentCount} / ${maxParticipants}`}
          </span>
        </div>
        {isFull && (
          <span className="text-destructive font-bold text-xs">LLENO</span>
        )}
        {isAlmostFull && !isFull && (
          <span className="text-yellow-500 font-bold text-xs">ÚLTIMOS CUPOS</span>
        )}
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            isFull 
              ? "bg-destructive" 
              : isAlmostFull 
                ? "bg-yellow-500" 
                : "bg-primary"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default EventCounter;

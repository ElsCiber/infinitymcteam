import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface EventCountdownProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EventCountdown = ({ targetDate }: EventCountdownProps) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <Card className="p-4 md:p-6 bg-card border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-105">
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-black text-primary mb-2 animate-glow">
          {value.toString().padStart(2, "0")}
        </div>
        <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-bold">
          {label}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <TimeUnit value={timeLeft.days} label="Días" />
        <TimeUnit value={timeLeft.hours} label="Horas" />
        <TimeUnit value={timeLeft.minutes} label="Minutos" />
        <TimeUnit value={timeLeft.seconds} label="Segundos" />
      </div>
    </div>
  );
};

export default EventCountdown;

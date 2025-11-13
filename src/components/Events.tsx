import { Card } from "@/components/ui/card";

interface Event {
  title: string;
  players?: string;
  date?: string;
  organizer?: string;
  image: string;
  status: "upcoming" | "ongoing" | "completed";
}

const events: Event[] = [
  {
    title: "Survival Games Championship",
    players: "100 jugadores",
    date: "Próximamente",
    organizer: "Infinity Team",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    status: "upcoming",
  },
  {
    title: "Infinity Hardcore",
    players: "50 jugadores",
    date: "En Progreso",
    organizer: "Infinity Team",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    status: "ongoing",
  },
  {
    title: "Build Battle Tournament",
    players: "64 jugadores",
    date: "Marzo 2024",
    organizer: "Infinity Team",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
    status: "completed",
  },
  {
    title: "Sky Wars League",
    players: "128 jugadores",
    date: "Febrero 2024",
    organizer: "Infinity Team",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    status: "completed",
  },
];

const Events = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/50";
      case "ongoing":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "completed":
        return "bg-muted/50 text-muted-foreground border-muted";
      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Próximamente";
      case "ongoing":
        return "En Progreso";
      case "completed":
        return "Finalizado";
      default:
        return "";
    }
  };

  return (
    <section id="events" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-card to-background"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Nuestros <span className="text-primary">Eventos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiencias únicas diseñadas para la comunidad de Minecraft
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                {event.players && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">👥</span>
                    {event.players}
                  </p>
                )}
                
                {event.date && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">📅</span>
                    {event.date}
                  </p>
                )}
                
                {event.organizer && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">⚡</span>
                    {event.organizer}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;

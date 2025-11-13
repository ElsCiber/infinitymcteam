import { Button } from "@/components/ui/button";
import infinityLogo from "@/assets/infinity-logo.png";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary animate-float"
              style={{
                width: Math.random() * 300 + 50 + "px",
                height: Math.random() * 300 + 50 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 5 + "s",
                animationDuration: Math.random() * 10 + 10 + "s",
                filter: "blur(60px)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center animate-fade-in">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <img
              src={infinityLogo}
              alt="Infinity Team"
              className="w-40 h-40 md:w-56 md:h-56 animate-glow"
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
            Creamos eventos en{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Minecraft
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">
            Infinity Team organiza eventos épicos para la comunidad de Minecraft. Survival Games,
            eventos personalizados y experiencias únicas. ¿Estás listo para la aventura?
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="hero"
              size="lg"
              onClick={() => scrollToSection("events")}
              className="min-w-[200px]"
            >
              Ver Eventos
            </Button>
            <Button
              variant="hero-outline"
              size="lg"
              onClick={() => scrollToSection("team")}
              className="min-w-[200px]"
            >
              Conoce al Equipo
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-foreground rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

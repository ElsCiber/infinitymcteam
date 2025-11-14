import { Button } from "@/components/ui/button";
import infinityLogo from "@/assets/infinity-logo-transparent.png";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(8px)' }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Blue overlay with opacity */}
        <div className="absolute inset-0 bg-primary/30"></div>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center animate-fade-in">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <img src={infinityLogo} alt="Infinity Team" className="w-40 h-40 md:w-56 md:h-56" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 lg:text-6xl">
            Creamos eventos en{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Minecraft
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">Hacemos eventos para la comunidad. Eventos como: Squid Games, Alice in Borderland, entre otros..</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" onClick={() => scrollToSection("events")} className="min-w-[200px]">
              Ver Eventos
            </Button>
            <Button variant="hero-outline" size="lg" onClick={() => scrollToSection("team")} className="min-w-[200px]">
              Conoce al Equipo
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        
      </div>
    </section>;
};
export default Hero;
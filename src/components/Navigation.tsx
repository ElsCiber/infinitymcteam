import { Button } from "@/components/ui/button";
import infinityLogo from "@/assets/infinity-logo-transparent.png";

const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <img src={infinityLogo} alt="Infinity Team" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">INFINITY</span>
              <span className="text-xs text-muted-foreground tracking-wider">TEAM</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("events")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Eventos
            </button>
            <button
              onClick={() => scrollToSection("team")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Equipo
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Contacto
            </button>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button variant="default" size="default" className="font-semibold">
              Descargar Cliente
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

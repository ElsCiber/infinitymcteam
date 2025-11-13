import infinityLogo from "@/assets/infinity-logo-transparent.png";
const Footer = () => {
  return <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={infinityLogo} alt="Infinity Team" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">Infinity Team</span>
              <span className="text-xs text-muted-foreground">Eventos de Minecraft</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © 2025 Infinity Team. Todos los derechos reservados.
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Términos
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
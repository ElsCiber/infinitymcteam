import { Button } from "@/components/ui/button";
const Contact = () => {
  return <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-card to-background"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Únete a la <span className="text-primary">Comunidad</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Síguenos en nuestras redes sociales y mantente al tanto de todos nuestros eventos
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://discord.com/invite/uCxQVJSguB" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="min-w-[180px] hover:bg-primary hover:text-primary-foreground hover:border-primary">
                Discord
              </Button>
            </a>
            <a href="https://x.com/InfinityTeamMC" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="min-w-[180px] hover:bg-primary hover:text-primary-foreground hover:border-primary">
                X
              </Button>
            </a>
            <a href="https://www.youtube.com/@InfinityTeamMC" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="min-w-[180px] hover:bg-primary hover:text-primary-foreground hover:border-primary">
                YouTube
              </Button>
            </a>
            <a href="https://ko-fi.com/infinityteam" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="min-w-[180px] hover:bg-primary hover:text-primary-foreground hover:border-primary">
                Ko-Fi
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;
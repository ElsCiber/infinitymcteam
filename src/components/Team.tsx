const Team = () => {
  const teamMembers = [
    { role: "Fundador", name: "Steve", specialty: "Eventos & Administración" },
    { role: "Builder", name: "Alex", specialty: "Construcción & Mapas" },
    { role: "Developer", name: "Herobrine", specialty: "Plugins & Mods" },
    { role: "Moderador", name: "Enderman", specialty: "Comunidad" },
  ];

  return (
    <section id="team" className="py-24 relative bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Nuestro <span className="text-primary">Equipo</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionales dedicados a crear las mejores experiencias
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group text-center space-y-4 p-6 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 bg-background"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-4xl group-hover:animate-float">
                ⭐
              </div>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                  {member.role}
                </p>
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

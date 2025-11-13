import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  avatar_url?: string;
}
const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadTeamMembers();
  }, []);
  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("team_members").select("*").order("display_order");
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return <section id="team" className="py-24 relative bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
      </section>;
  }
  return <section id="team" className="py-24 relative bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Nuestro <span className="text-primary">Equipo</span>
          </h2>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map(member => <div key={member.id} className="group text-center space-y-4 p-6 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 bg-background">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-4xl group-hover:animate-float">
                {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" /> : "⭐"}
              </div>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                  {member.role}
                </p>
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                {member.specialty && <p className="text-sm text-muted-foreground">{member.specialty}</p>}
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Team;
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground snap-y snap-mandatory overflow-y-scroll h-screen">
      <Navigation />
      <div className="snap-start">
        <Hero />
      </div>
      <div className="snap-start">
        <Events />
      </div>
      <div className="snap-start">
        <Team />
      </div>
      <div className="snap-start">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default Index;

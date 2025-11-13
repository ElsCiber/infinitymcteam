import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <Events />
      <Team />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

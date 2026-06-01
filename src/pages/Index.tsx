import { Navbar } from "@/components/flama/Navbar";
import { Hero } from "@/components/flama/Hero";
import { Marquee } from "@/components/flama/Marquee";
import { About } from "@/components/flama/About";
import { Community } from "@/components/flama/Community";
import { Contact } from "@/components/flama/Contact";
import bgImg from "@/assets/flama-running.png.asset.json";

const Index = () => {
  return (
    <main className="relative min-h-screen text-foreground">
      {/* Fixed full-page balloons background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImg.url})` }}
      />
      {/* No overlay — keep balloons image fully visible */}

      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Community />
      <Contact />
    </main>
  );
};

export default Index;

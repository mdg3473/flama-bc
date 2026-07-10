import { Navbar } from "@/components/flama/Navbar";
import { Hero } from "@/components/flama/Hero";
import { Marquee } from "@/components/flama/Marquee";
import { About } from "@/components/flama/About";
import { Community } from "@/components/flama/Community";
import { Contact } from "@/components/flama/Contact";
import bgVideo from "@/assets/bg-devocional.mp4.asset.json";

const Index = () => {
  return (
    <main className="relative min-h-screen text-foreground">
      {/* Fixed full-page balloons background */}
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 -z-10 w-full h-full object-contain bg-black"
      >
        <source src={bgVideo.url} type="video/mp4" />
      </video>
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

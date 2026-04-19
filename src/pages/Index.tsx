import { Navbar } from "@/components/flama/Navbar";
import { Hero } from "@/components/flama/Hero";
import { Marquee } from "@/components/flama/Marquee";
import { About } from "@/components/flama/About";
import { Sermons } from "@/components/flama/Sermons";
import { Devotional } from "@/components/flama/Devotional";
import { Gallery } from "@/components/flama/Gallery";
import { Shop } from "@/components/flama/Shop";
import { Contact } from "@/components/flama/Contact";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Sermons />
      <Devotional />
      <Gallery />
      <Shop />
      <Contact />
    </main>
  );
};

export default Index;

import { Navbar } from "@/components/flama/Navbar";
import { Gallery } from "@/components/flama/Gallery";
import balloonsBg from "@/assets/balloons-bg.jpg";

const Momentos = () => {
  return (
    <main className="relative min-h-screen text-foreground">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${balloonsBg})` }}
      />
      <Navbar />
      <div className="pt-24">
        <Gallery />
      </div>
    </main>
  );
};

export default Momentos;
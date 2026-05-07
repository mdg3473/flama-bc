import { Navbar } from "@/components/flama/Navbar";
import { Shop } from "@/components/flama/Shop";
import balloonsBg from "@/assets/balloons-bg.jpg";

const Loja = () => {
  return (
    <main className="relative min-h-screen text-foreground">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${balloonsBg})` }}
      />
      <Navbar />
      <div className="pt-24">
        <Shop />
      </div>
    </main>
  );
};

export default Loja;
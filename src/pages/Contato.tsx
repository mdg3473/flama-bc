import { Navbar } from "@/components/flama/Navbar";
import { Contact } from "@/components/flama/Contact";

const Contato = () => {
  return (
    <main className="relative min-h-screen bg-primary text-primary-foreground">
      <Navbar />
      <div className="pt-24">
        <Contact />
      </div>
    </main>
  );
};

export default Contato;

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/flama/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Sobre = () => {
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="container pt-32 md:pt-40 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8 font-display tracking-wider"
        >
          <ArrowLeft size={20} /> Voltar
        </Link>

        <h1 className="font-display text-5xl md:text-7xl leading-[0.9] mb-10 text-center">
          SOBRE O <span className="text-primary">FLAMA</span>
        </h1>

        <div className="max-w-3xl mx-auto text-lg leading-relaxed space-y-5">
          <p>
            O Flama nasceu do desejo de ver uma geração inteira ardendo pela presença de Deus. Mais do que um movimento, somos uma família — jovens, líderes e amigos que decidiram caminhar juntos, compartilhar a vida e descobrir, no dia a dia, o que significa seguir Jesus de verdade.
          </p>
          <p>
            Acreditamos que cada história importa, cada voz é ouvida e cada chamada é levada a sério. Vivemos a fé como caminhada, não como performance: com perguntas honestas, riso solto, lágrimas reais e amizades que sustentam. Nosso desejo é ver vidas transformadas pelo encontro com o Bom Pastor — e essa transformação acontece quando deixamos de ser plateia e passamos a ser comunidade.
          </p>
          <p>
            O Flama é espaço de encontro, de descoberta e de envio. É lugar de raiz e também de fogo. É onde a juventude entende que pertencer a Jesus é a aventura mais real que se pode viver.
          </p>
          <p>
            E na ideia de vocês nos conhecerem, cada líder resolveu compartilhar um pouco da sua história. Clique em cada bolinha abaixo para conhecer quem está por trás do Flama.
          </p>
        </div>
      </section>

      <section className="container pb-24">
        <div className="mx-auto grid grid-cols-10 gap-2 md:gap-3 max-w-2xl">
          {Array.from({ length: 100 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedLeader(i)}
              aria-label={`Líder ${i + 1}`}
              className="aspect-square rounded-full bg-primary/80 hover:bg-primary hover:scale-110 transition-all duration-200 ring-1 ring-primary/40 hover:ring-2 hover:ring-primary"
            />
          ))}
        </div>
      </section>

      <Dialog open={selectedLeader !== null} onOpenChange={(open) => !open && setSelectedLeader(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Líder {selectedLeader !== null ? selectedLeader + 1 : ""}</DialogTitle>
            <DialogDescription>
              Em breve: foto, história e documentos deste líder.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sobre;
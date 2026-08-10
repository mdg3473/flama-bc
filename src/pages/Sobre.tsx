import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { Navbar } from "@/components/flama/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LEADERS = Array.from({ length: 100 });

const Sobre = () => {
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

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
        <div className="mx-auto flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl">
          {LEADERS.map((_, i) => {
            const near = hovered !== null && Math.abs(hovered - i) === 1;
            return (
              <button
                key={i}
                onClick={() => setSelectedLeader(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`Líder ${i + 1}`}
                style={{ animationDelay: `${(i % 20) * 40}ms` }}
                className={`group relative h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-flame text-primary-foreground
                  ring-1 ring-primary/30 shadow-glow/0 animate-fade-in
                  transition-[transform,box-shadow,filter] duration-300 ease-out
                  hover:scale-125 hover:shadow-glow hover:ring-2 hover:ring-primary
                  active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${near ? "scale-110" : ""}`}
              >
                <span className="absolute inset-0 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                <span className="relative flex h-full w-full items-center justify-center font-display text-sm md:text-base opacity-80 group-hover:opacity-100">
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={selectedLeader !== null} onOpenChange={(open) => !open && setSelectedLeader(null)}>
        <DialogContent className="rounded-3xl border-primary/20 text-center sm:max-w-md">
          <div className="mx-auto -mt-14 mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-flame shadow-glow animate-scale-in">
            <Flame className="h-10 w-10 text-primary-foreground" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="font-display text-3xl tracking-wide">
              Líder {selectedLeader !== null ? selectedLeader + 1 : ""}
            </DialogTitle>
            <DialogDescription className="max-w-xs">
              Em breve: foto, história e a chamada deste líder.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-center gap-1.5">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sobre;
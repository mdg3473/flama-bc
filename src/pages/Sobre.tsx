import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { Navbar } from "@/components/flama/Navbar";
import { usePopIn } from "@/hooks/usePopIn";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LEADERS = Array.from({ length: 100 });

const Sobre = () => {
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);
  const head = usePopIn<HTMLDivElement>();

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
            E na ideia de vocês nos conhecerem, cada líder resolveu compartilhar um pouco da sua história. Clique em cada card abaixo para conhecer quem está por trás do Flama.
          </p>
        </div>
      </section>

      {/* Líderes — Kinetic Flame Grid */}
      <section className="pb-24 px-4 md:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            ref={head.ref}
            className={`${head.className} flex flex-col md:flex-row items-start md:items-end justify-between mb-16 md:mb-24 gap-8`}
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
                  Lideranças
                </span>
              </div>
              <h2 className="font-display text-6xl md:text-8xl text-foreground leading-[0.85] tracking-tight">
                QUEM{" "}
                <span className="text-primary relative inline-block">
                  INCENDEIA
                  <span className="absolute -bottom-2 left-0 h-3 w-full -rotate-1 bg-primary/10" />
                </span>{" "}
                A CHAMA.
              </h2>
            </div>
            <p className="max-w-xs text-muted-foreground text-lg leading-snug">
              Cada líder compartilhou um pouco da sua história. Passe o mouse sobre os cards e
              clique para conhecer quem está por trás do Flama.
            </p>
          </div>

          {/* Staggered grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-x-12 md:gap-y-24">
            {LEADERS.map((_, i) => (
              <div key={i} className={`group relative ${i % 3 === 1 ? "md:mt-16" : ""}`}>
                {/* Flame aura */}
                <div className="pointer-events-none absolute inset-0 scale-75 rounded-lg bg-primary opacity-0 blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-25" />

                {/* Card */}
                <button
                  onClick={() => setSelectedLeader(i)}
                  aria-label={`Líder ${i + 1}`}
                  className="relative z-10 block aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* Placeholder photo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-card to-muted transition-colors duration-500 group-hover:from-primary group-hover:to-ember">
                    <Flame className="h-12 w-12 text-primary transition-colors duration-500 group-hover:text-primary-foreground md:h-14 md:w-14" />
                    <span className="font-display text-3xl tracking-wide text-foreground/50 transition-colors duration-500 group-hover:text-primary-foreground">
                      Líder {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 z-20 flex h-20 w-20 scale-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-500 ease-out delay-75 group-hover:scale-100 md:h-24 md:w-24">
                  <Flame size={28} className="md:h-8 md:w-8" />
                </div>

                {/* Name reveal */}
                <div className="mt-8 text-center">
                  <h3 className="relative overflow-hidden font-display text-2xl uppercase tracking-wide text-foreground md:text-3xl">
                    <span className="block transition-transform duration-500 group-hover:-translate-y-full">
                      Líder {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute left-0 top-0 block translate-y-full text-primary transition-transform duration-500 group-hover:translate-y-0">
                      Líder {String(i + 1).padStart(2, "0")}
                    </span>
                  </h3>
                </div>
              </div>
            ))}
          </div>
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
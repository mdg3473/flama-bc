import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { Navbar } from "@/components/flama/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LEADERS = Array.from({ length: 100 });

/** Constelação: distribui os líderes em anéis concêntricos (espiral áurea) */
const RINGS = [
  { count: 8, r: 14 },
  { count: 14, r: 25 },
  { count: 20, r: 36 },
  { count: 26, r: 45 },
  { count: 32, r: 49 },
];

const POSITIONS = (() => {
  const pts: { x: number; y: number; ring: number; size: number }[] = [];
  let idx = 0;
  RINGS.forEach((ring, ri) => {
    for (let i = 0; i < ring.count && idx < 100; i++, idx++) {
      const a = (i / ring.count) * Math.PI * 2 + ri * 0.4;
      pts.push({
        x: 50 + Math.cos(a) * ring.r,
        y: 50 + Math.sin(a) * ring.r * 0.86,
        ring: ri,
        size: 1 - ri * 0.09,
      });
    }
  });
  return pts;
})();

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
        <div className="relative mx-auto aspect-square w-full max-w-[680px] md:max-w-[820px]">
          {/* anéis guia */}
          {[30, 52, 74, 92, 100].map((s, i) => (
            <span
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
              style={{ width: `${s}%`, height: `${s * 0.86}%` }}
            />
          ))}

          {/* núcleo */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-flame shadow-glow animate-flicker md:h-28 md:w-28">
            <Flame className="h-10 w-10 text-primary-foreground" />
          </div>

          {POSITIONS.map((p, i) => {
            const isHover = hovered === i;
            const dim = hovered !== null && !isHover;
            return (
              <button
                key={i}
                onClick={() => setSelectedLeader(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`Líder ${i + 1}`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size * 3.4}rem`,
                  height: `${p.size * 3.4}rem`,
                  animationDelay: `${i * 25}ms`,
                  transitionDelay: `${(i % 12) * 15}ms`,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-flame
                  text-primary-foreground ring-1 ring-primary/30 animate-fade-in
                  transition-[transform,opacity,box-shadow] duration-500 ease-out
                  hover:z-20 hover:scale-[1.6] hover:shadow-glow hover:ring-2 hover:ring-primary
                  active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${dim ? "opacity-40 scale-90" : "opacity-100"}`}
              >
                <span className="absolute inset-0 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                <span className="relative flex h-full w-full items-center justify-center font-display text-xs opacity-0 transition-opacity group-hover:opacity-100">
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
import { BookOpen, Calendar } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

export const Devotional = () => {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const pop = usePopIn<HTMLDivElement>();

  return (
    <section id="devocional" className="relative py-24 md:py-32 overflow-hidden bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          {/* Left vertical label */}
          <div className="lg:col-span-2 flex lg:flex-col items-start justify-start gap-4">
            <div className="hidden lg:block writing-vertical font-display text-6xl tracking-widest text-muted-foreground/40" style={{ writingMode: 'vertical-rl' }}>
              DEVOCIONAL
            </div>
            <div className="mono text-xs text-muted-foreground tracking-[0.4em]">DIÁRIO</div>
          </div>

          {/* Card */}
          <div ref={pop.ref} className={`${pop.className} lg:col-span-10 relative`}>
            <div className="absolute -top-3 -left-3 right-3 bottom-3 border-2 border-primary -z-0" />
            <div className="relative bg-card border-2 border-border p-8 md:p-14">
              <div className="flex items-center gap-2 mono text-xs text-muted-foreground mb-8 uppercase tracking-widest">
                <Calendar size={14} /> {today}
              </div>

              <div className="flex items-start gap-4 mb-6">
                <BookOpen className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <div className="mono text-sm text-primary mb-2">SALMOS 27:1</div>
                  <p className="font-display text-3xl md:text-5xl leading-tight">
                    "O Senhor é a minha luz e a minha salvação;<br />
                    a quem temerei?"
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-border">
                <div className="md:col-span-2">
                  <h3 className="font-display text-2xl tracking-wide mb-3 text-primary">REFLEXÃO</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tem dia que tudo escurece. As contas, a faculdade, o relacionamento, a cabeça que
                    não para. E é exatamente nesse breu que Davi escreve: <em>Deus é luz</em>. Não uma
                    teoria — experiência. Hoje, antes de qualquer rolagem, respira fundo e lembra:
                    quem caminha com Ele não tropeça no escuro.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-2xl tracking-wide mb-3 text-primary">ORAÇÃO</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Senhor, ilumina meus passos hoje. Tira o medo do meu peito e me ensina a confiar
                    quando eu não consigo enxergar. Em nome de Jesus, amém.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a href="#" className="mono text-xs px-4 py-2 bg-foreground text-background font-bold tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors">
                  ← ONTEM
                </a>
                <a href="#" className="mono text-xs px-4 py-2 bg-primary text-primary-foreground font-bold tracking-widest hover:bg-primary-glow transition-colors">
                  ARQUIVO COMPLETO
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

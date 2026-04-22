import { MessageSquare, Users, Sparkles } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

export const Community = () => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <section id="community" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-40 pointer-events-none" />
      <div className="container relative">
        <div className="mb-14">
          <div className="mono text-xs text-primary tracking-[0.4em] mb-4">/ 06 — COMMUNITY</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
            UM ESPAÇO <span className="text-flame">PRA CHAMAR</span> DE NOSSO
          </h2>
        </div>

        <div
          ref={pop.ref}
          className={`${pop.className} relative max-w-4xl mx-auto`}
        >
          {/* Offset shadow frame */}
          <div className="absolute -top-3 -left-3 right-3 bottom-3 border-2 border-primary -z-0" />

          <div className="relative bg-card border-2 border-border p-8 md:p-14">
            <div className="flex items-center gap-3 mono text-xs text-muted-foreground mb-8 uppercase tracking-widest">
              <Sparkles size={14} className="text-primary" /> Em breve
            </div>

            <div className="flex items-start gap-4 mb-8">
              <MessageSquare className="h-10 w-10 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-display text-3xl md:text-5xl leading-tight mb-4">
                  UM CHAT PRA <span className="text-flame">GERAÇÃO FLAMA</span>
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Um espaço estilo Discord, feito pra você conversar, compartilhar pedidos
                  de oração, marcar encontros e viver comunidade — todos os dias, não só no
                  domingo.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-xl tracking-wide mb-1">CONEXÃO</h4>
                  <p className="text-sm text-muted-foreground">
                    Encontre pessoas que vivem a mesma fé que você.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-xl tracking-wide mb-1">CANAIS</h4>
                  <p className="text-sm text-muted-foreground">
                    Espaços por tema: oração, música, estudos, eventos.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-xl tracking-wide mb-1">AO VIVO</h4>
                  <p className="text-sm text-muted-foreground">
                    Cultos, devocionais e papo reto em tempo real.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                disabled
                className="mono text-xs px-5 py-3 bg-foreground text-background font-bold tracking-widest opacity-60 cursor-not-allowed"
              >
                EM CONSTRUÇÃO
              </button>
              <a
                href="#contato"
                className="mono text-xs px-5 py-3 bg-primary text-primary-foreground font-bold tracking-widest hover:bg-primary-glow transition-colors"
              >
                QUERO SER AVISADO →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
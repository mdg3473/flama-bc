import { MessageSquare, Users, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePopIn } from "@/hooks/usePopIn";
import communityBg from "@/assets/community-bg.png";
import { useAuth } from "@/hooks/useAuth";

export const Community = () => {
  const pop = usePopIn<HTMLDivElement>();
  const head = usePopIn<HTMLHeadingElement>();
  const img = usePopIn<HTMLDivElement>();
  const { user } = useAuth();
  return (
    <section id="community" className="relative py-24 md:py-32 overflow-hidden bg-primary text-white">
      <div className="container relative">
        <div className="mb-14 text-center">
          <h2 ref={head.ref} className={`${head.className} font-display text-5xl md:text-7xl leading-[0.9] text-white`}>
            COMMUNITY
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image left, blended */}
          <div ref={img.ref} className={`${img.className} relative`}>
            <img
              src={communityBg}
              alt="Comunidade Flama"
              className="w-full h-auto object-cover rounded-3xl"
            />
          </div>

          {/* Card right */}
          <div ref={pop.ref} className={`${pop.className} relative`}>
            <div className="absolute -top-3 -left-3 right-3 bottom-3 border-2 border-primary rounded-3xl -z-0" />
            <div className="relative bg-card border-2 border-border rounded-3xl p-8 md:p-12 text-foreground">
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

            {user ? (
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/comunidade"
                  className="mono text-xs px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold tracking-widest hover:bg-primary-glow transition-colors inline-flex items-center gap-2"
                >
                  ENTRAR NO CHAT <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="mt-10">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/auth?mode=login"
                    className="mono text-xs px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold tracking-widest hover:bg-primary-glow transition-colors inline-flex items-center gap-2"
                  >
                    LOGIN <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="mono text-xs text-muted-foreground mt-4">
                  Ainda não tem conta?{" "}
                  <Link to="/auth?mode=signup" className="underline text-primary hover:text-primary-glow">
                    Faça seu cadastro
                  </Link>
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
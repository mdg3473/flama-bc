import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { Navbar } from "@/components/flama/Navbar";
import { usePopIn } from "@/hooks/usePopIn";
import { TEAMS } from "@/lib/teams";

const Sobre = () => {
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {TEAMS.map((t) => (
              <Link key={t.slug} to={`/sobre/${t.slug}`} className="group relative">
                <div className="pointer-events-none absolute inset-0 scale-75 rounded-lg bg-primary opacity-0 blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-25" />
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-b from-card to-muted flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:-translate-y-3 group-hover:from-primary group-hover:to-ember group-hover:shadow-2xl">
                  <Flame className="h-12 w-12 text-primary transition-colors group-hover:text-primary-foreground" />
                  <span className="font-display text-3xl md:text-5xl tracking-wide transition-colors group-hover:text-primary-foreground">
                    {t.name.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Sobre;
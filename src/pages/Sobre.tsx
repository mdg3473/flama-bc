import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Flame, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/flama/Navbar";
import { usePopIn } from "@/hooks/usePopIn";
import { TEAMS } from "@/lib/teams";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Person = {
  id: string;
  name: string;
  role: string | null;
  team: string;
  photo_path: string | null;
  testimony_path: string | null;
  photoUrl?: string;
  pdfUrl?: string;
};

const teamName = (slug: string) => TEAMS.find((t) => t.slug === slug)?.name ?? slug;

const sign = async (path: string | null) => {
  if (!path) return undefined;
  const { data } = await supabase.storage.from("team").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
};

const PersonCard = ({
  p,
  i,
  onOpen,
}: {
  p: Person;
  i: number;
  onOpen: (p: Person) => void;
}) => {
  const pop = usePopIn<HTMLButtonElement>();
  const big = i % 7 === 0;

  return (
    <button
      ref={pop.ref}
      style={{ transitionDelay: `${(i % 8) * 60}ms` }}
      onClick={() => onOpen(p)}
      className={`${pop.className} group relative text-left ${
        big ? "col-span-2 row-span-2" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 scale-75 rounded-lg bg-primary opacity-0 blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-30" />
      <div
        className={`relative overflow-hidden rounded-lg bg-muted transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-flame ${
          big ? "aspect-square" : "aspect-[3/4]"
        }`}
      >
        {p.photoUrl ? (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 pt-10">
          <p className="font-display text-xl leading-none text-background">{p.name}</p>
          <p className="text-xs text-background/80">{p.role || teamName(p.team)}</p>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {teamName(p.team)}
        </span>
      </div>
    </button>
  );
};

const Sobre = () => {
  const head = usePopIn<HTMLDivElement>();
  const [people, setPeople] = useState<Person[]>([]);
  const [filter, setFilter] = useState<string>("todos");
  const [viewing, setViewing] = useState<Person | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at");
      const list = await Promise.all(
        (data ?? []).map(async (m) => ({
          ...m,
          photoUrl: await sign(m.photo_path),
          pdfUrl: await sign(m.testimony_path),
        }))
      );
      setPeople(list);
    })();
  }, []);

  const visible =
    filter === "todos" ? people : people.filter((p) => p.team === filter);

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
            E na ideia de vocês nos conhecerem, cada líder resolveu compartilhar um pouco da sua história. Clique em cada pessoa abaixo para conhecer quem está por trás do Flama.
          </p>
        </div>
      </section>

      {/* Pessoas — mural criativo */}
      <section className="pb-24 px-4 md:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div
            ref={head.ref}
            className={`${head.className} flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-8`}
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
                  Lideranças & Times
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
              Passe o mouse, sinta o calor e clique para conhecer a história de
              cada um.
            </p>
          </div>

          {/* Filtro por time */}
          <div className="flex flex-wrap gap-2 mb-10">
            {["todos", ...TEAMS.map((t) => t.slug)].map((slug) => (
              <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wider transition-all ${
                  filter === slug
                    ? "bg-primary text-primary-foreground shadow-flame"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {slug === "todos" ? "Todos" : teamName(slug)}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">
              Em breve você vai conhecer quem faz o Flama acontecer.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-fr gap-4 md:gap-6">
              {visible.map((p, i) => (
                <PersonCard key={p.id} p={p} i={i} onOpen={setViewing} />
              ))}
            </div>
          )}

          {/* Acesso rápido às páginas de cada time (gestão) */}
          <div className="mt-16 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Flame size={16} className="text-primary" />
            <span>Páginas dos times:</span>
            {TEAMS.map((t) => (
              <Link
                key={t.slug}
                to={`/sobre/${t.slug}`}
                className="text-primary hover:underline font-semibold"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pop-up da pessoa (design provisório — será substituído pelo layout enviado) */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-lg">
          {viewing && (
            <div className="grid sm:grid-cols-2">
              <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[420px] bg-muted">
                {viewing.photoUrl ? (
                  <img
                    src={viewing.photoUrl}
                    alt={viewing.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent sm:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
                <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {teamName(viewing.team)}
                </span>
                <DialogTitle className="font-display text-4xl md:text-5xl leading-[0.9]">
                  {viewing.name}
                </DialogTitle>
                {viewing.role && (
                  <p className="text-muted-foreground -mt-2">{viewing.role}</p>
                )}
                <div className="h-[2px] w-12 bg-primary" />
                {viewing.pdfUrl ? (
                  <Button asChild className="rounded-xl w-fit">
                    <a href={viewing.pdfUrl} target="_blank" rel="noreferrer">
                      <FileText /> Ler testemunho
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Testemunho em breve.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sobre;

import s1 from "@/assets/bible-1.jpg";
import s2 from "@/assets/bible-2.jpg";
import s3 from "@/assets/bible-3.jpg";
import { Play, Clock } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

const sermons = [
  { img: s1, title: "Não tenha medo do fogo", speaker: "Léo Crocoli", duration: "1 min", tag: "" },
  { img: s2, title: "A geração do deserto", speaker: "Léo Crocoli", duration: "1 min", tag: "" },
  { img: s3, title: "Quando Deus silencia", speaker: "Léo Crocoli", duration: "1 min", tag: "" },
];

export const Sermons = () => (
  <section id="sermoes" className="relative py-24 md:py-32">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-white">
          MENSAGENS
        </h2>
        <a href="#" className="inline-block mt-4 mono text-sm tracking-widest text-white hover:underline underline-offset-4">
          VER TODOS →
        </a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((s, i) => (
          <SermonCard key={s.title} sermon={s} index={i} />
        ))}
      </div>
    </div>
  </section>
);

const SermonCard = ({ sermon: s, index }: { sermon: typeof sermons[number]; index: number }) => {
  const pop = usePopIn<HTMLElement>();
  return (
    <article
      ref={pop.ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`${pop.className} group relative overflow-hidden rounded-3xl border-2 border-border hover:border-primary bg-background cursor-pointer transition-all`}
    >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                width={1280}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-flame">
                  <Play className="h-8 w-8 text-primary-foreground fill-current ml-1" />
                </div>
              </div>
              {s.tag && (
                <span className="absolute top-4 left-4 mono text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold tracking-wider">
                  {s.tag}
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl tracking-wide mb-2 group-hover:text-primary transition-colors">
                {s.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{s.speaker}</span>
                <span className="flex items-center gap-1.5 mono"><Clock size={14} /> {s.duration}</span>
              </div>
            </div>
    </article>
  );
};

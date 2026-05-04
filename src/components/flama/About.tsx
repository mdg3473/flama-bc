import { Flame, Users, Heart } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

const pillars = [
  { icon: Flame, title: "", text: "" },
  { icon: Users, title: "", text: "" },
  { icon: Heart, title: "", text: "" },
];

export const About = () => (
  <section id="sobre" className="relative py-24 md:py-32 overflow-hidden">
    <div className="container relative">
      <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mb-12 text-center text-white">
        QUEM NÓS <span className="text-flame">SOMOS</span>
      </h2>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <p className="text-white text-lg leading-relaxed mb-6">
          O FLAMA ............
        </p>
      </div>

      <div className="grid gap-4">
        {pillars.map((p, i) => (
          <PillarCard key={p.title} pillar={p} index={i} />
        ))}
      </div>
      </div>
    </div>
  </section>
);

const PillarCard = ({ pillar: p, index: i }: { pillar: (typeof pillars)[number]; index: number }) => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <div
      ref={pop.ref}
      style={{ transitionDelay: `${i * 120}ms` }}
      className={`${pop.className} group relative p-6 md:p-8 border-2 border-border bg-card hover:border-primary transition-all hover:-translate-y-1 hover:shadow-flame`}
    >
      <div className="absolute top-4 right-6 mono text-xs text-muted-foreground">0{i + 1}</div>
      <p.icon className="h-10 w-10 text-primary mb-4 group-hover:animate-flicker" />
      <h3 className="font-display text-3xl tracking-wider mb-2">{p.title}</h3>
      <p className="text-muted-foreground">{p.text}</p>
    </div>
  );
};

import { Flame, Users, Heart } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

const pillars = [
  { icon: Flame, title: "Avivamento", text: "Buscamos a presença de Deus de forma autêntica, sem fórmula pronta." },
  { icon: Users, title: "Comunidade", text: "Família que se escuta, ora junto e caminha na mesma direção." },
  { icon: Heart, title: "Missão", text: "Levar Jesus pra escola, pro trampo, pra rua — com verdade e amor." },
];

export const About = () => (
  <section id="sobre" className="relative py-24 md:py-32 overflow-hidden">
    <div className="container relative">
      <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mb-12 text-center">
        QUEM NÓS <span className="text-flame">SOMOS</span>
      </h2>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          A FLAMA nasceu do desejo de uma juventude que cansou de viver pela metade. A gente acredita
          que o evangelho é radical, vivo, e cabe em qualquer estilo, em qualquer beco.
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Aqui você é chamado pelo nome, é desafiado, é amado de verdade. Sem máscara, sem palco —
          só Cristo no centro de tudo.
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

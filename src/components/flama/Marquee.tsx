import { Flame } from "lucide-react";

const items = ["Não tema o fogo", "Geração FLAMA", "Cristo é o caminho", "Avivamento agora", "Sem vergonha do evangelho"];

export const Marquee = () => (
  <div className="relative bg-primary text-primary-foreground py-5 overflow-hidden border-y-2 border-foreground">
    <div className="marquee">
      {[...items, ...items, ...items].map((t, i) => (
        <div key={i} className="flex items-center gap-6 shrink-0">
          <Flame className="h-6 w-6" />
          <span className="font-display text-3xl md:text-4xl tracking-wider whitespace-nowrap">{t}</span>
        </div>
      ))}
    </div>
  </div>
);

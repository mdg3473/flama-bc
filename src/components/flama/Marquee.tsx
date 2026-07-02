import flamaLogo from "@/assets/flama-logo.png";

const items = [
  'João 10:14 "Eu sou o bom pastor; conheço as minhas ovelhas, e elas me conhecem,"',
];

export const Marquee = () => (
  <div className="relative bg-primary text-white py-5 overflow-hidden border-y-2 border-primary mt-8">
    <div className="marquee">
      {[...items, ...items, ...items, ...items, ...items, ...items].map((t, i) => (
        <div key={i} className="flex items-center gap-6 shrink-0">
          <img
            src={flamaLogo}
            alt="FLAMA"
            className="h-8 w-auto object-contain invert brightness-0 [filter:invert(1)]"
          />
          <span className="font-display text-3xl md:text-4xl tracking-wider whitespace-nowrap">{t}</span>
        </div>
      ))}
    </div>
  </div>
);

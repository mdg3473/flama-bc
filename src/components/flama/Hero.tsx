import heroImg from "@/assets/hero-flama.jpg";
import { ArrowDown } from "lucide-react";
import { FireText } from "./FireText";

export const Hero = () => {
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden flex items-end">
      {/* Background image */}
      <img
        src={heroImg}
        alt="Jovens da FLAMA adorando com chamas ao fundo"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      <div className="grain absolute inset-0" />

      {/* Caution tape */}
      <div className="absolute top-24 -left-10 right-0 caution-tape h-6 -rotate-2 opacity-80" />
      <div className="absolute top-32 -left-10 right-0 h-px bg-primary/40 -rotate-2" />

      {/* Content */}
      <div className="container relative z-10 pb-20 md:pb-32">
        <div className="mono text-xs md:text-sm text-primary tracking-[0.4em] mb-6 flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          MINISTÉRIO JOVEM · EST. 2024
        </div>

        <h1 className="font-display text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] leading-[0.85] tracking-tight">
          <span className="block text-background drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">ARDE</span>
          <span className="block text-flame cursor-pointer">
            <FireText text="FLAMA" />
          </span>
          <span className="block text-stroke-light">NA RUA</span>
        </h1>

        <p className="mt-8 max-w-xl text-base md:text-lg text-background/90 leading-relaxed">
          Somos uma geração que recusa o morno. Encontramos Jesus no asfalto, no barulho,
          na vida real — e levamos esse fogo pra onde a gente vai.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#sobre"
            className="group inline-flex items-center gap-3 px-7 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
          >
            Conhece a FLAMA
            <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
          </a>
          <a
            href="#sermoes"
            className="inline-flex items-center gap-3 px-7 py-4 border-2 border-background text-background font-bold uppercase tracking-widest text-sm hover:bg-background hover:text-foreground transition-colors"
          >
            Ver sermões
          </a>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 caution-tape h-5 z-20" />
    </section>
  );
};

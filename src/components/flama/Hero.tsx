import heroImg from "@/assets/balloons-bg.jpg";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden flex items-end">
      {/* Background image */}
      <img
        src={heroImg}
        alt="Jovens da FLAMA com balões coloridos numa noite de adoração"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      <div className="grain absolute inset-0" />

      {/* Content */}
      <div className="container relative z-10 pb-20 md:pb-32">
        <p className="max-w-xl text-base md:text-lg text-background/90 leading-relaxed">
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
    </section>
  );
};

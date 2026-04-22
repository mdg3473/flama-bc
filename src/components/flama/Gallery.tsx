import balloonsBg from "@/assets/balloons-bg.jpg";
import { usePopIn } from "@/hooks/usePopIn";

export const Gallery = () => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <section id="galeria" className="relative py-24 md:py-32 bg-card/40 border-y border-border">
      <div className="container">
        <div className="mb-14 text-left">
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-foreground">
            MOMENTS
          </h2>
        </div>

        <div ref={pop.ref} className={`${pop.className} relative aspect-square max-w-2xl mx-auto overflow-hidden border-2 border-border`}>
          <img
            src={balloonsBg}
            alt="FLAMA - Balões"
            width={1280}
            height={1280}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};


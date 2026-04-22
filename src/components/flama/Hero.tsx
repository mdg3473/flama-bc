import heroImg from "@/assets/balloons-bg.jpg";
import flamaLogo from "@/assets/flama-logo.png";

export const Hero = () => {
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src={heroImg}
        alt="Jovens da FLAMA com balões coloridos numa noite de adoração"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-foreground/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
      <div className="grain absolute inset-0" />

      {/* Logo on top of the image */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-6 md:pt-10 flex justify-center pointer-events-none">
        <img
          src={flamaLogo}
          alt="FLAMA"
          width={520}
          height={360}
          className="h-28 sm:h-32 md:h-40 lg:h-52 w-auto object-contain animate-flicker drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] invert"
        />
      </div>
    </section>
  );
};

import flamaLogo from "@/assets/flama-logo.png";

export const Hero = () => {
  return (
    <section id="top" className="relative h-[85vh] w-full overflow-hidden">
      {/* Transparent — shows the fixed page background (balloons) */}

      {/* Logo on top of the image */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-2 md:pt-4 flex justify-center pointer-events-none">
        <img
          src={flamaLogo}
          alt="FLAMA"
          width={520}
          height={360}
          className="h-24 sm:h-28 md:h-36 lg:h-44 w-auto object-contain animate-flicker drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] invert"
        />
      </div>
    </section>
  );
};

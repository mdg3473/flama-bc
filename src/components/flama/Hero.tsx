import flamaLogo from "@/assets/flama-logo.png";

export const Hero = () => {
  return (
    <section id="top" className="relative h-[85vh] w-full overflow-hidden">
      {/* Transparent — shows the fixed page background (balloons) */}

      {/* Logo on top of the image */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-6 md:pt-10 flex justify-center pointer-events-none">
        <img
          src={flamaLogo}
          alt="FLAMA"
          width={520}
          height={360}
          className="h-40 sm:h-48 md:h-56 lg:h-72 w-auto object-contain animate-flicker drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] invert"
        />
      </div>
    </section>
  );
};

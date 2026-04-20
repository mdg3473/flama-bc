import flamaLogo from "@/assets/flama-logo.png";

/**
 * Slim top bar that sits above the navbar, dedicated to the official logo.
 * Stays out of the way of the rest of the layout.
 */
export const TopBar = () => (
  <div className="fixed top-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-md border-b border-border">
    <div className="container flex items-center justify-center py-2">
      <a href="#top" aria-label="FLAMA — início">
        <img
          src={flamaLogo}
          alt="FLAMA"
          width={160}
          height={80}
          className="h-10 md:h-12 w-auto object-contain animate-flicker"
        />
      </a>
    </div>
  </div>
);
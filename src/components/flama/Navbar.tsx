import { useEffect, useState } from "react";
import flamaLogo from "@/assets/flama-logo.png";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#sermoes", label: "Sermões" },
  { href: "#devocional", label: "Devocional" },
  { href: "#galeria", label: "Galeria" },
  { href: "#loja", label: "Loja" },
  { href: "#contato", label: "Contato" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between py-4">
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src={flamaLogo}
            alt="FLAMA logo"
            width={120}
            height={80}
            className="h-12 w-auto object-contain animate-flicker transition-transform group-hover:rotate-3"
          />
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contato"
          className="hidden lg:inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wider hover:bg-primary-glow transition-colors shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none duration-150"
        >
          Faça parte
        </a>

        <button
          aria-label="menu"
          className="lg:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border">
          <ul className="container py-6 flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-display text-2xl tracking-wider hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

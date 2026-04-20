import { useEffect, useState } from "react";
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
      <nav className="container flex items-center justify-end py-4">
        <ul className="hidden lg:flex items-center gap-8 mr-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-sm font-semibold uppercase tracking-widest transition-colors hover:text-primary ${
                  scrolled ? "text-muted-foreground" : "text-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          aria-label="menu"
          className={`lg:hidden transition-colors ${
            scrolled ? "text-foreground" : "text-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          }`}
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

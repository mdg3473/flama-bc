import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import flamaLogo from "@/assets/flama-logo.png";

const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#sermoes", label: "Sermões" },
  { href: "#devocional", label: "Devocional" },
  { href: "#galeria", label: "Galeria" },
  { href: "#loja", label: "Loja" },
  { href: "#community", label: "Community" },
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
        scrolled ? "bg-primary border-b border-primary" : "bg-transparent"
      }`}
    >
      <nav className="container relative flex items-center justify-between py-4">
        <a
          href="#top"
          className={`absolute left-1/2 -translate-x-1/2 flex items-center transition-opacity ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-label="FLAMA"
        >
          <img src={flamaLogo} alt="FLAMA" className="h-14 md:h-16 w-auto object-contain [filter:brightness(0)_invert(1)]" />
        </a>
        <span aria-hidden className="w-7" />
        <button
          aria-label="menu"
          className={`transition-colors ${
            scrolled ? "text-white" : "text-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {open && (
        <div className="bg-background/95 backdrop-blur-lg border-t border-border">
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

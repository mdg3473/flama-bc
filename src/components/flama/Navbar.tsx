import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import flamaLogo from "@/assets/flama-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileDialog } from "@/components/ProfileDialog";

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
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); setName(""); return; }
    supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => { setAvatarUrl(data?.avatar_url ?? null); setName(data?.full_name ?? ""); });
  }, [user, profileOpen]);

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
        {user ? (
          <button onClick={() => setProfileOpen(true)} aria-label="Perfil" className="relative z-10">
            <Avatar className="h-10 w-10 border-2 border-white">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback>{name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <span aria-hidden className="w-7" />
        )}
        <a
          href="#top"
          className={`absolute left-1/2 -translate-x-1/2 flex items-center transition-opacity ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-label="FLAMA"
        >
          <img src={flamaLogo} alt="FLAMA" className="h-14 md:h-16 w-auto object-contain [filter:brightness(0)_invert(1)]" />
        </a>
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
      {user && <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={user.id} />}
    </header>
  );
};

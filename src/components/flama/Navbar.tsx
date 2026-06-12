import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Image as ImageIcon, Youtube, BookOpen, Info, Users, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import flamaLogo from "@/assets/flama-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileDialog } from "@/components/ProfileDialog";

const links = [
  { to: "/comunidade", label: "Community", icon: Users },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

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

  const showRedBar = !isHome || scrolled || open;

  const handleNav = () => {
    setOpen(false);
    setScrolled(true);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showRedBar ? "bg-primary" : "bg-transparent"
      }`}
    >
      <nav className="container relative z-50 flex items-center justify-between py-4">
        {user ? (
          <button onClick={() => setProfileOpen(true)} aria-label="Perfil" className="relative z-10">
            <Avatar className="h-10 w-10 border-2 border-white bg-transparent">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-transparent text-transparent" />
            </Avatar>
          </button>
        ) : (
          <span aria-hidden className="w-7" />
        )}
        <Link
          to="/"
          onClick={() => { setOpen(false); }}
          className={`absolute left-1/2 -translate-x-1/2 flex items-center transition-opacity ${showRedBar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-label="FLAMA"
        >
          <img src={flamaLogo} alt="FLAMA" className="h-14 md:h-16 w-auto object-contain [filter:brightness(0)_invert(1)]" />
        </Link>
        <button
          aria-label="menu"
          className={`relative z-50 transition-colors ${
            showRedBar ? "text-white" : "text-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {open && (
        <div className={`bg-primary ${showRedBar ? "" : "fixed inset-0 top-0 z-40 pt-20"}`}>
          <ul className="container py-6 flex flex-col gap-4 text-primary-foreground">
            <li>
              <Link
                to="/sobre"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <Info size={26} /> Sobre
              </Link>
            </li>
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={handleNav}
                    className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
                  >
                    <Icon size={26} /> {l.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/loja"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <ShoppingBag size={26} /> Loja
              </Link>
            </li>
            <li>
              <Link
                to="/devocional"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <BookOpen size={26} /> Devocional
              </Link>
            </li>
            <li>
              <Link
                to="/momentos"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <ImageIcon size={26} /> Galeria
              </Link>
            </li>
            <li>
              <Link
                to="/mensagens"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <Youtube size={26} /> Shorts
              </Link>
            </li>
            <li>
              <Link
                to="/contato"
                onClick={handleNav}
                className="flex items-center gap-3 py-2 font-display text-2xl tracking-wider hover:opacity-80"
              >
                <Mail size={26} /> Contato
              </Link>
            </li>
          </ul>
        </div>
      )}
      {user && <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={user.id} />}
    </header>
  );
};

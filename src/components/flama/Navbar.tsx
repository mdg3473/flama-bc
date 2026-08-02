import { useEffect, useState } from "react";
import { ShoppingBag, Image as ImageIcon, Youtube, BookOpen, Info, Users, Mail, LogIn, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import flamaLogo from "@/assets/flama-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileDialog } from "@/components/ProfileDialog";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { to: "/sobre", label: "Sobre", icon: Info },
  { to: "/comunidade", label: "Community", icon: Users },
  { to: "/loja", label: "Loja", icon: ShoppingBag },
  { to: "/devocional", label: "Devocional", icon: BookOpen },
  { to: "/momentos", label: "Galeria", icon: ImageIcon },
  { to: "/mensagens", label: "Shorts", icon: Youtube },
  { to: "/contato", label: "Contato", icon: Mail },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isIndex = location.pathname === "/home" || location.pathname === "/";

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

  const showRedBar = !isHome && !(location.pathname === "/home");
  const showBottomNav = !isIndex || scrolled;
  const showLogo = showRedBar || (isIndex && scrolled);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Até logo!" });
    navigate("/");
  };

  return (
    <>
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
            className={`absolute left-1/2 -translate-x-1/2 flex items-center transition-all duration-500 ${
              showLogo ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
            }`}
            aria-label="FLAMA"
          >
            <img
              src={flamaLogo}
              alt="FLAMA"
              className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] [filter:brightness(0)_invert(1)]"
            />
          </Link>
          <span aria-hidden className="w-10" />
        </nav>
        {user && <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={user.id} />}
      </header>

      <div
        className={`fixed bottom-4 left-1/2 z-50 px-3 max-w-[calc(100vw-1rem)] transition-all duration-700 ${
          showBottomNav
            ? "opacity-100 -translate-x-1/2 translate-y-0 scale-100 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
            : "opacity-0 -translate-x-1/2 translate-y-16 scale-75 pointer-events-none"
        }`}
      >
        <nav className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground rounded-[1.5rem] shadow-xl px-3 py-2 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={`group flex flex-col items-center justify-center rounded-2xl transition-all px-2.5 py-1.5 sm:px-3 hover:bg-white/15 ${
                  active ? "bg-white/20" : ""
                }`}
              >
                <Icon size={20} className="transition-transform duration-300 group-hover:scale-[2.5] group-hover:-translate-y-2" />
                <span className="hidden sm:block text-[10px] mt-0.5 tracking-wide uppercase">{item.label}</span>
              </Link>
            );
          })}
          <span className="w-px h-8 bg-white/25 mx-1" />
          {user ? (
            <button
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="group flex flex-col items-center justify-center rounded-2xl transition-all px-2.5 py-1.5 sm:px-3 hover:bg-white/15"
            >
              <LogOut size={20} className="transition-transform duration-300 group-hover:scale-[2.5] group-hover:-translate-y-2" />
              <span className="hidden sm:block text-[10px] mt-0.5 tracking-wide uppercase">Sair</span>
            </button>
          ) : (
            <Link
              to="/auth"
              aria-label="Entrar"
              title="Entrar"
              className="group flex flex-col items-center justify-center rounded-2xl transition-all px-2.5 py-1.5 sm:px-3 hover:bg-white/15"
            >
              <LogIn size={20} className="transition-transform duration-300 group-hover:scale-[2.5] group-hover:-translate-y-2" />
              <span className="hidden sm:block text-[10px] mt-0.5 tracking-wide uppercase">Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

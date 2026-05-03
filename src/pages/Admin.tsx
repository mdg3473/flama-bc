import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { CHANNELS } from "@/lib/channels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flame, LogOut, Users, Wifi } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  parents_names: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  grade: string;
  created_at: string;
};

const Admin = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  usePresence(user?.id);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "Admin | Flama";
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav("/auth", { replace: true });
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setAuthorized(!!data));
  }, [user, loading, nav]);

  useEffect(() => {
    if (!authorized) return;
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setProfiles(data as Profile[]));

    const channel = supabase.channel("online-users");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineIds(new Set(Object.keys(state)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/", { replace: true });
  };

  if (loading || authorized === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center">
          <Flame className="mx-auto text-primary mb-4" size={40} />
          <h1 className="font-display text-3xl mb-2">ACESSO RESTRITO</h1>
          <p className="text-muted-foreground mb-6">
            Esta área é exclusiva para administradores.
          </p>
          <Link to="/comunidade" className="mono text-xs px-5 py-3 bg-primary text-primary-foreground font-bold tracking-widest">
            VOLTAR À COMUNIDADE
          </Link>
        </div>
      </main>
    );
  }

  const online = profiles.filter((p) => onlineIds.has(p.id));
  const gradeLabel = (g: string) => CHANNELS.find((c) => c.id === g)?.label ?? g;
  const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("pt-BR") : "—");
  const age = (s: string | null) => {
    if (!s) return "—";
    const d = new Date(s);
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Flame size={22} />
            <span className="font-display text-2xl tracking-wider">FLAMA · ADMIN</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/comunidade" className="mono text-xs px-3 py-2 border border-border hover:bg-muted">CHAT</Link>
            <Button variant="ghost" onClick={logout}><LogOut size={16} /> Sair</Button>
          </div>
        </div>
      </header>

      <div className="container py-10 space-y-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border-2 border-border p-6 flex items-center gap-4">
            <Users className="text-primary" size={36} />
            <div>
              <div className="mono text-xs uppercase tracking-widest text-muted-foreground">Cadastrados</div>
              <div className="font-display text-5xl leading-none">{profiles.length}</div>
            </div>
          </div>
          <div className="bg-card border-2 border-border p-6 flex items-center gap-4">
            <Wifi className="text-primary" size={36} />
            <div>
              <div className="mono text-xs uppercase tracking-widest text-muted-foreground">Online agora</div>
              <div className="font-display text-5xl leading-none">{online.length}</div>
            </div>
          </div>
        </div>

        {/* Online list */}
        <section>
          <h2 className="font-display text-3xl mb-4">ONLINE AGORA</h2>
          {online.length === 0 ? (
            <p className="text-muted-foreground">Ninguém online no momento.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {online.map((p) => (
                <div key={p.id} className="bg-card border-2 border-border p-3 flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {p.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.full_name}</div>
                    <div className="text-xs text-muted-foreground">{gradeLabel(p.grade)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All members */}
        <section>
          <h2 className="font-display text-3xl mb-4">TODOS OS CADASTROS</h2>
          <div className="bg-card border-2 border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Pais / Responsáveis</th>
                  <th className="p-3">Nascimento</th>
                  <th className="p-3">Idade</th>
                  <th className="p-3">Ano</th>
                  <th className="p-3">Cadastro</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name} />}
                          <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                            {p.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.parents_names ?? "—"}</td>
                    <td className="p-3">{fmtDate(p.birth_date)}</td>
                    <td className="p-3">{age(p.birth_date)}</td>
                    <td className="p-3">{gradeLabel(p.grade)}</td>
                    <td className="p-3 text-muted-foreground">{fmtDate(p.created_at)}</td>
                    <td className="p-3">
                      {onlineIds.has(p.id) ? (
                        <span className="inline-flex items-center gap-1 text-green-600 mono text-xs">
                          <span className="h-2 w-2 rounded-full bg-green-500" /> ONLINE
                        </span>
                      ) : (
                        <span className="mono text-xs text-muted-foreground">offline</span>
                      )}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum cadastro ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Admin;
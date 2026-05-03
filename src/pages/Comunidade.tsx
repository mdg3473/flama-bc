import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CHANNELS, type ChannelId } from "@/lib/channels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hash, LogOut, Send, Flame, Menu, X } from "lucide-react";

type Message = {
  id: string;
  channel: string;
  user_id: string;
  content: string;
  created_at: string;
};

type Profile = { id: string; full_name: string; avatar_url: string | null; grade: string };

const Comunidade = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [channel, setChannel] = useState<ChannelId>("6ano");
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Comunidade Flama | Chat";
  }, []);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [loading, user, nav]);

  // Load messages + realtime
  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(200);
      if (active && data) setMessages(data as Message[]);
    };
    load();

    const ch = supabase
      .channel(`messages:${channel}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
        (payload) => setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id)),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [user, channel]);

  // Load profiles for visible messages
  useEffect(() => {
    const missing = Array.from(new Set(messages.map((m) => m.user_id))).filter((id) => !profiles[id]);
    if (missing.length === 0) return;
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, grade")
      .in("id", missing)
      .then(({ data }) => {
        if (!data) return;
        setProfiles((p) => {
          const next = { ...p };
          for (const row of data as Profile[]) next[row.id] = row;
          return next;
        });
      });
  }, [messages, profiles]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !user || sending) return;
    setSending(true);
    setText("");
    const { error } = await supabase.from("messages").insert({ channel, content, user_id: user.id });
    setSending(false);
    if (error) setText(content);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/", { replace: true });
  };

  const channelLabel = useMemo(() => CHANNELS.find((c) => c.id === channel)?.label ?? "", [channel]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <main className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r-2 border-border flex flex-col transition-transform`}
      >
        <div className="p-4 border-b-2 border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Flame size={20} />
            <span className="font-display text-2xl tracking-wider">FLAMA</span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="fechar">
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pt-4 pb-2 mono text-xs uppercase tracking-widest text-muted-foreground">
          Canais
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setChannel(c.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded transition-colors ${
                channel === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Hash size={16} /> <span className="font-medium">{c.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t-2 border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      {/* Chat */}
      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b-2 border-border flex items-center px-4 gap-3 bg-card">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="menu">
            <Menu size={22} />
          </button>
          <Hash size={18} className="text-primary" />
          <h1 className="font-display text-2xl tracking-wider">{channelLabel}</h1>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground mono text-xs uppercase tracking-widest">
              Seja o primeiro a escrever em {channelLabel}
            </p>
          )}
          {messages.map((m) => {
            const p = profiles[m.user_id];
            const initials = (p?.full_name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={m.id} className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  {p?.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{p?.full_name ?? "Membro"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="break-words whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="p-4 border-t-2 border-border flex gap-2 bg-card">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Mensagem em ${channelLabel}`}
            maxLength={2000}
            autoComplete="off"
          />
          <Button type="submit" disabled={sending || !text.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Comunidade;
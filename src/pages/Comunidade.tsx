import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { VoiceStage } from "@/components/community/VoiceStage";
import { CHANNELS, TEXT_CATEGORIES, VOICE_CHANNELS, type ChannelId } from "@/lib/channels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProfileDialog } from "@/components/ProfileDialog";
import { toast } from "@/hooks/use-toast";
import {
  Hash,
  Home,
  Menu,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  MonitorUp,
  PhoneOff,
  Users,
  Settings,
  Smile,
  Send,
  Pencil,
  Trash2,
  Reply,
  X,
  Volume2,
  ChevronDown,
  Plus,
  Pin,
  ShieldCheck,
  Shield,
  VolumeX,
} from "lucide-react";
import flamaLogo from "@/assets/flama-logo.png";

type Message = {
  id: string;
  channel: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  reply_to: string | null;
  pinned?: boolean;
};

type Mute = { id: string; user_id: string; reason: string | null; expires_at: string | null };

type Profile = { id: string; full_name: string; avatar_url: string | null; grade?: string };

const EMOJIS = ["🔥","🙏","❤️","😂","😮","😢","👍","👎","🙌","✨","😎","🥳","💯","☝️","😅","🤝","🕊️","📖","⚡","🍔"];

const initialsOf = (name?: string) =>
  (name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 864e5);
  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yest.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const Comunidade = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  usePresence(user?.id);

  const [channel, setChannel] = useState<ChannelId>("6ano");
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [me, setMe] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [staffRoles, setStaffRoles] = useState<Record<string, "admin" | "moderator">>({});
  const [mutes, setMutes] = useState<Mute[]>([]);
  const [muteTarget, setMuteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showPinned, setShowPinned] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [typing, setTyping] = useState<Record<string, number>>({});
  const [online, setOnline] = useState<string[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [voiceRoom, setVoiceRoom] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingChanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTypedRef = useRef(0);

  const voice = useVoiceRoom(voiceRoom, user?.id);
  const localStream = voice.localStream.current;

  useEffect(() => { document.title = "Comunidade FLAMA | Chat"; }, []);
  useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  // my profile + role
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("id, full_name, avatar_url, grade").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setMe(data as Profile); });
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
    supabase.rpc("has_role", { _user_id: user.id, _role: "moderator" })
      .then(({ data }) => setIsMod(!!data));
  }, [user, profileOpen]);

  // staff roles (badges) + mutes
  const loadModeration = useCallback(async () => {
    const [{ data: roles }, { data: mts }] = await Promise.all([
      supabase.from("user_roles").select("user_id, role").in("role", ["admin", "moderator"]),
      supabase.from("community_mutes").select("id, user_id, reason, expires_at"),
    ]);
    if (roles) {
      const map: Record<string, "admin" | "moderator"> = {};
      for (const r of roles as { user_id: string; role: string }[]) {
        if (r.role === "admin") map[r.user_id] = "admin";
        else if (!map[r.user_id]) map[r.user_id] = "moderator";
      }
      setStaffRoles(map);
    }
    if (mts) {
      const now = Date.now();
      setMutes((mts as Mute[]).filter((m) => !m.expires_at || new Date(m.expires_at).getTime() > now));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadModeration();
    const ch = supabase
      .channel("community_mutes")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_mutes" }, () => void loadModeration())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadModeration]);

  // messages + realtime
  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase.from("messages").select("*").eq("channel", channel)
      .order("created_at", { ascending: true }).limit(300)
      .then(({ data }) => { if (active && data) setMessages(data as Message[]); });

    const ch = supabase
      .channel(`messages:${channel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
        (p) => setMessages((prev) => (prev.some((m) => m.id === (p.new as Message).id) ? prev : [...prev, p.new as Message])))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
        (p) => setMessages((prev) => prev.map((m) => (m.id === (p.new as Message).id ? (p.new as Message) : m))))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
        (p) => setMessages((prev) => prev.filter((m) => m.id !== (p.old as Message).id)))
      .subscribe();

    return () => { active = false; supabase.removeChannel(ch); };
  }, [user, channel]);

  // typing indicator channel
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`typing:${channel}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const id = (payload as { id: string }).id;
        setTyping((t) => ({ ...t, [id]: Date.now() }));
      })
      .subscribe();
    typingChanRef.current = ch;
    const iv = setInterval(() => {
      setTyping((t) => {
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(t)) if (Date.now() - v < 4000) next[k] = v;
        return next;
      });
    }, 1500);
    return () => { clearInterval(iv); supabase.removeChannel(ch); typingChanRef.current = null; };
  }, [user, channel]);

  // presence of the community (member list)
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("community-room", { config: { presence: { key: user.id } } });
    ch.on("presence", { event: "sync" }, () => setOnline(Object.keys(ch.presenceState())))
      .subscribe(async (s) => { if (s === "SUBSCRIBED") await ch.track({ at: Date.now() }); });
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // resolve profiles for messages, online members and voice participants
  useEffect(() => {
    const ids = new Set<string>([
      ...messages.map((m) => m.user_id),
      ...online,
      ...voice.participants.map((p) => p.id),
    ]);
    const missing = Array.from(ids).filter((id) => id && !profiles[id]);
    if (missing.length === 0) return;
    supabase.rpc("get_public_profiles", { _ids: missing }).then(({ data }) => {
      if (!data) return;
      setProfiles((prev) => {
        const next = { ...prev };
        for (const row of data as Profile[]) next[row.id] = row;
        return next;
      });
    });
  }, [messages, online, voice.participants, profiles]);

  useEffect(() => {
    setMembers(online.map((id) => profiles[id]).filter(Boolean) as Profile[]);
  }, [online, profiles]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, voiceRoom]);

  const channelLabel = useMemo(() => CHANNELS.find((c) => c.id === channel)?.label ?? "", [channel]);
  const byId = useMemo(() => Object.fromEntries(messages.map((m) => [m.id, m])), [messages]);

  const notifyTyping = useCallback(() => {
    if (!user) return;
    if (Date.now() - lastTypedRef.current < 1800) return;
    lastTypedRef.current = Date.now();
    typingChanRef.current?.send({ type: "broadcast", event: "typing", payload: { id: user.id } });
  }, [user]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user || sending) return;
    setSending(true);
    setText("");
    const reply = replyTo?.id ?? null;
    setReplyTo(null);
    const { error } = await supabase.from("messages").insert({ channel, content, user_id: user.id, reply_to: reply });
    setSending(false);
    if (error) { setText(content); toast({ title: "Não foi possível enviar", variant: "destructive" }); }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const content = editText.trim();
    if (!content) return;
    const { error } = await supabase.from("messages")
      .update({ content, edited_at: new Date().toISOString() }).eq("id", editingId);
    if (error) toast({ title: "Não foi possível editar", variant: "destructive" });
    setEditingId(null);
    setEditText("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) toast({ title: "Não foi possível apagar", variant: "destructive" });
  };

  const isStaff = isAdmin || isMod;
  const myMute = mutes.find((m) => m.user_id === user?.id) ?? null;
  const pinned = messages.filter((m) => m.pinned);

  const togglePin = async (m: Message) => {
    const { error } = await supabase.from("messages").update({ pinned: !m.pinned }).eq("id", m.id);
    if (error) toast({ title: "Não foi possível fixar", variant: "destructive" });
  };

  const muteUser = async (userId: string, minutes: number | null, reason?: string) => {
    if (!user) return;
    const { error } = await supabase.from("community_mutes").insert({
      user_id: userId,
      muted_by: user.id,
      reason: reason ?? null,
      expires_at: minutes ? new Date(Date.now() + minutes * 60000).toISOString() : null,
    });
    if (error) toast({ title: "Não foi possível silenciar", variant: "destructive" });
    else { toast({ title: "Membro silenciado" }); void loadModeration(); }
    setMuteTarget(null);
  };

  const unmuteUser = async (userId: string) => {
    const { error } = await supabase.from("community_mutes").delete().eq("user_id", userId);
    if (error) toast({ title: "Não foi possível remover o silenciamento", variant: "destructive" });
    else { toast({ title: "Silenciamento removido" }); void loadModeration(); }
    setMuteTarget(null);
  };

  const logout = async () => { await supabase.auth.signOut(); nav("/", { replace: true }); };

  const typingNames = Object.keys(typing)
    .filter((id) => id !== user?.id)
    .map((id) => profiles[id]?.full_name?.split(" ")[0])
    .filter(Boolean);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const voiceLabel = VOICE_CHANNELS.find((v) => v.id === voiceRoom)?.label;

  return (
    <main className="dc h-[100dvh] w-full flex bg-background text-foreground overflow-hidden">
      {/* Server rail */}
      <div className="hidden md:flex w-[72px] shrink-0 flex-col items-center gap-2 bg-[hsl(var(--dc-rail))] py-3">
        <Link to="/home" className="group relative grid h-12 w-12 place-items-center rounded-lg bg-primary transition-all hover:rounded-lg" title="FLAMA">
          <img src={flamaLogo} alt="FLAMA" className="h-8 w-8 object-contain [filter:brightness(0)_invert(1)]" />
        </Link>
        <div className="h-px w-8 bg-white/10" />
        <Link to="/home" className="grid h-12 w-12 place-items-center rounded-lg bg-[hsl(var(--card))] text-muted-foreground transition-all hover:rounded-lg hover:bg-primary hover:text-primary-foreground" title="Voltar ao site">
          <Home size={20} />
        </Link>
        <button className="grid h-12 w-12 place-items-center rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--dc-online))] transition-all hover:rounded-lg hover:bg-[hsl(var(--dc-online))] hover:text-white" title="Em breve">
          <Plus size={20} />
        </button>
      </div>

      {/* Channel sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-60 shrink-0 flex flex-col bg-card transition-transform`}>
        <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
          <span className="font-semibold truncate">FLAMA Community</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="fechar"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {TEXT_CATEGORIES.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-1 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <ChevronDown size={12} /> {cat}
              </div>
              {CHANNELS.filter((c) => c.category === cat).map((c) => {
                const active = c.id === channel;
                return (
                  <button key={c.id}
                    onClick={() => { setChannel(c.id); setSidebarOpen(false); }}
                    className={`group w-full flex items-center gap-1.5 rounded-md px-2 py-[6px] text-[15px] transition-colors ${
                      active ? "bg-[hsl(var(--dc-active))] text-foreground" : "text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-foreground"
                    }`}>
                    <Hash size={18} className="opacity-70" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div>
            <div className="flex items-center gap-1 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <ChevronDown size={12} /> Canais de voz
            </div>
            {VOICE_CHANNELS.map((v) => {
              const active = voiceRoom === v.id;
              return (
                <div key={v.id}>
                  <button onClick={() => setVoiceRoom(active ? null : v.id)}
                    className={`group w-full flex items-center gap-1.5 rounded-md px-2 py-[6px] text-[15px] transition-colors ${
                      active ? "bg-[hsl(var(--dc-active))] text-foreground" : "text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-foreground"
                    }`}>
                    <Volume2 size={18} className="opacity-70" />
                    <span className="truncate">{v.label}</span>
                  </button>
                  {active && (
                    <div className="pl-7 py-1 space-y-1">
                      {voice.participants.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            {profiles[p.id]?.avatar_url && <AvatarImage src={profiles[p.id]!.avatar_url!} />}
                            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                              {initialsOf(profiles[p.id]?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{p.id === user.id ? "Você" : profiles[p.id]?.full_name ?? "Membro"}</span>
                          {p.muted && <MicOff size={12} className="text-destructive" />}
                          {p.sharing && <MonitorUp size={12} className="text-[hsl(var(--dc-online))]" />}
                        </div>
                      ))}
                      {voice.participants.length === 0 && (
                        <p className="text-xs text-muted-foreground">Ninguém na sala ainda</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice control bar */}
        {voiceRoom && (
          <div className="px-2 py-2 bg-[hsl(var(--dc-rail))]">
            <div className="flex items-center justify-between px-1">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--dc-online))] truncate">
                  {voice.connecting ? "Conectando…" : "Voz conectada"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{voiceLabel}</p>
              </div>
              <button onClick={() => setVoiceRoom(null)} title="Desconectar"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-destructive">
                <PhoneOff size={18} />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <button onClick={voice.toggleShare}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  voice.sharing ? "bg-[hsl(var(--dc-online))] text-white" : "bg-[hsl(var(--dc-hover))] text-foreground hover:bg-[hsl(var(--dc-active))]"
                }`}>
                <MonitorUp size={14} /> {voice.sharing ? "Parar" : "Tela"}
              </button>
              <button onClick={voice.toggleMute}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  voice.muted ? "bg-destructive text-destructive-foreground" : "bg-[hsl(var(--dc-hover))] text-foreground hover:bg-[hsl(var(--dc-active))]"
                }`}>
                {voice.muted ? <MicOff size={14} /> : <Mic size={14} />} {voice.muted ? "Mudo" : "Mic"}
              </button>
            </div>
            {voice.error && <p className="mt-2 text-[11px] text-destructive">{voice.error}</p>}
          </div>
        )}

        {/* User panel */}
        <div className="flex items-center gap-2 bg-[hsl(var(--dc-rail))] px-2 py-2">
          <button onClick={() => setProfileOpen(true)} className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 hover:bg-[hsl(var(--dc-hover))]">
            <span className="relative">
              <Avatar className="h-8 w-8">
                {me?.avatar_url && <AvatarImage src={me.avatar_url} alt={me.full_name} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initialsOf(me?.full_name)}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--dc-rail))] bg-[hsl(var(--dc-online))]" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium">{me?.full_name ?? "Você"}</span>
              <span className="block truncate text-[11px] text-muted-foreground">online</span>
            </span>
          </button>
          <button onClick={voice.toggleMute} title="Microfone"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))]">
            {voice.muted ? <MicOff size={18} className="text-destructive" /> : <Mic size={18} />}
          </button>
          <button onClick={voice.toggleDeafen} title="Silenciar áudio"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))]">
            {voice.deafened ? <HeadphoneOff size={18} className="text-destructive" /> : <Headphones size={18} />}
          </button>
          <button onClick={logout} title="Sair"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))]">
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Chat column */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 shadow-sm">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="menu"><Menu size={20} /></button>
          <Hash size={20} className="text-muted-foreground" />
          <h1 className="font-semibold">{channelLabel}</h1>
          <span className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <p className="hidden truncate text-sm text-muted-foreground sm:block">Converse com a galera do {channelLabel}</p>
          <button onClick={() => setShowMembers((s) => !s)} title="Membros"
            className="ml-auto grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-foreground">
            <Users size={20} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {voiceRoom && (
              <div className="shrink-0 border-b border-border bg-[hsl(var(--dc-rail))]/60">
                <VoiceStage
                  remoteStreams={voice.remoteStreams}
                  participants={voice.participants}
                  profiles={profiles as Record<string, { id: string; full_name: string; avatar_url: string | null }>}
                  deafened={voice.deafened}
                  selfId={user.id}
                  selfSharing={voice.sharing}
                  selfStream={localStream}
                />
              </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-6 pt-4">
                <div className="mb-2 grid h-16 w-16 place-items-center rounded-lg bg-[hsl(var(--dc-hover))]">
                  <Hash size={32} />
                </div>
                <h2 className="text-2xl font-bold">Bem-vindo ao #{channelLabel}</h2>
                <p className="text-sm text-muted-foreground">Este é o começo do canal #{channelLabel}.</p>
              </div>

              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const p = profiles[m.user_id];
                const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
                const grouped = !newDay && prev?.user_id === m.user_id && !m.reply_to &&
                  new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60000;
                const mine = m.user_id === user.id;
                const parent = m.reply_to ? byId[m.reply_to] : null;

                return (
                  <div key={m.id}>
                    {newDay && (
                      <div className="my-4 flex items-center gap-2">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-[11px] font-semibold text-muted-foreground">{dayLabel(m.created_at)}</span>
                        <span className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div className={`group relative flex gap-3 rounded px-2 hover:bg-[hsl(var(--dc-hover))]/40 ${grouped ? "py-0.5" : "mt-3 py-0.5"}`}>
                      {grouped ? (
                        <span className="w-10 shrink-0 pt-1 text-[10px] text-transparent group-hover:text-muted-foreground">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <Avatar className="mt-0.5 h-10 w-10 shrink-0">
                          {p?.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name} />}
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initialsOf(p?.full_name)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div className="min-w-0 flex-1">
                        {parent && (
                          <div className="mb-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                            <Reply size={12} className="rotate-180" />
                            <span className="font-medium">{profiles[parent.user_id]?.full_name ?? "Membro"}</span>
                            <span className="truncate opacity-80">{parent.content}</span>
                          </div>
                        )}
                        {!grouped && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-foreground">{p?.full_name ?? "Membro"}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(m.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}

                        {editingId === m.id ? (
                          <div className="mt-1">
                            <Textarea
                              value={editText}
                              autoFocus
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void saveEdit(); }
                                if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                              }}
                              className="min-h-[44px] resize-none rounded-lg border-0 bg-[hsl(var(--dc-hover))]"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              ESC para <button className="text-primary" onClick={() => setEditingId(null)}>cancelar</button> • ENTER para{" "}
                              <button className="text-primary" onClick={() => void saveEdit()}>salvar</button>
                            </p>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                            {m.content}
                            {m.edited_at && <span className="ml-1 text-[10px] text-muted-foreground">(editada)</span>}
                          </p>
                        )}
                      </div>

                      <div className="absolute -top-3 right-2 hidden gap-0.5 rounded-lg border border-border bg-card p-0.5 shadow-md group-hover:flex">
                        <button title="Responder" onClick={() => setReplyTo(m)}
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-foreground">
                          <Reply size={15} />
                        </button>
                        {mine && (
                          <button title="Editar" onClick={() => { setEditingId(m.id); setEditText(m.content); }}
                            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-foreground">
                            <Pencil size={15} />
                          </button>
                        )}
                        {(mine || isAdmin) && (
                          <button title="Apagar" onClick={() => void remove(m.id)}
                            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-[hsl(var(--dc-hover))] hover:text-destructive">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="shrink-0 px-4 pb-5">
              {replyTo && (
                <div className="flex items-center justify-between rounded-t-lg bg-[hsl(var(--dc-hover))] px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="truncate">
                    Respondendo a <b className="text-foreground">{profiles[replyTo.user_id]?.full_name ?? "Membro"}</b>
                  </span>
                  <button onClick={() => setReplyTo(null)} aria-label="cancelar resposta"><X size={14} /></button>
                </div>
              )}
              <div className={`relative flex items-end gap-2 bg-[hsl(var(--dc-hover))] px-3 py-2 ${replyTo ? "rounded-b-lg" : "rounded-xl"}`}>
                <Textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); notifyTyping(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  placeholder={`Conversar em #${channelLabel}`}
                  maxLength={2000}
                  rows={1}
                  className="max-h-40 min-h-[24px] resize-none border-0 bg-transparent p-0 text-[15px] focus-visible:ring-0"
                />
                <button onClick={() => setEmojiOpen((o) => !o)} aria-label="emojis"
                  className="mb-0.5 text-muted-foreground transition-colors hover:text-foreground">
                  <Smile size={20} />
                </button>
                <Button size="icon" className="mb-0.5 h-8 w-8 rounded-xl" disabled={sending || !text.trim()} onClick={() => void send()}>
                  <Send size={15} />
                </Button>
                {emojiOpen && (
                  <div className="absolute bottom-14 right-0 z-20 grid w-64 grid-cols-7 gap-1 rounded-lg border border-border bg-popover p-2 shadow-xl">
                    {EMOJIS.map((e) => (
                      <button key={e} className="rounded-md p-1 text-xl hover:bg-[hsl(var(--dc-hover))]"
                        onClick={() => { setText((t) => t + e); setEmojiOpen(false); }}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="h-4 pt-1 text-[11px] text-muted-foreground">
                {typingNames.length > 0 &&
                  `${typingNames.join(", ")} ${typingNames.length > 1 ? "estão" : "está"} digitando…`}
              </p>
            </div>
          </div>

          {/* Member list */}
          {showMembers && (
            <aside className="hidden w-60 shrink-0 overflow-y-auto bg-card px-2 py-4 lg:block">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Online — {members.length}
              </p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[hsl(var(--dc-hover))]">
                  <span className="relative">
                    <Avatar className="h-8 w-8">
                      {m.avatar_url && <AvatarImage src={m.avatar_url} alt={m.full_name} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{initialsOf(m.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[hsl(var(--dc-online))]" />
                  </span>
                  <span className="truncate text-sm">{m.full_name}</span>
                </div>
              ))}
              {members.length === 0 && <p className="px-2 text-xs text-muted-foreground">Ninguém online agora</p>}
            </aside>
          )}
        </div>
      </section>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={user.id} />
    </main>
  );
};

export default Comunidade;

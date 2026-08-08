import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";
import { VideoDialog, type VideoRow } from "./VideoDialog";

export const Sermons = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playing, setPlaying] = useState<VideoRow | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, speaker, kind, duration_label, storage_path, external_url, published, published_at")
      .order("published_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar vídeos", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = (data ?? []) as VideoRow[];
    setVideos(list);
    const paths = list.map((v) => v.storage_path).filter(Boolean) as string[];
    if (paths.length) {
      const { data: signed } = await supabase.storage.from("videos").createSignedUrls(paths, 60 * 60 * 12);
      const map: Record<string, string> = {};
      signed?.forEach((s) => {
        if (s.signedUrl && s.path) map[s.path] = s.signedUrl;
      });
      setUrls(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const remove = async (v: VideoRow) => {
    if (v.storage_path) await supabase.storage.from("videos").remove([v.storage_path]);
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
      return;
    }
    setVideos((prev) => prev.filter((x) => x.id !== v.id));
  };

  const srcOf = (v: VideoRow) => (v.storage_path ? urls[v.storage_path] : undefined);

  return (
    <section id="sermoes" className="relative py-24 md:py-32">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-white">MENSAGENS</h2>
          <p className="mono mt-3 text-xs uppercase tracking-widest text-white/70">
            Clipes e pregações completas
          </p>
        </div>

        {isAdmin && user && (
          <div className="mb-10 flex justify-center">
            <Button className="rounded-lg" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus size={16} /> Adicionar vídeo / clipe
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-white/70">Carregando…</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-white/70">Nenhum vídeo por enquanto.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <VideoCard
                key={v.id}
                video={v}
                index={i}
                src={srcOf(v)}
                isAdmin={isAdmin}
                onPlay={() => setPlaying(v)}
                onEdit={() => { setEditing(v); setDialogOpen(true); }}
                onDelete={() => remove(v)}
              />
            ))}
          </div>
        )}
      </div>

      {playing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setPlaying(null)}>
          {playing.storage_path && srcOf(playing) ? (
            <video
              src={srcOf(playing)}
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] w-full max-w-5xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : playing.external_url ? (
            <iframe
              src={playing.external_url.replace("watch?v=", "embed/")}
              title={playing.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full max-w-5xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
          <Button variant="secondary" className="absolute right-6 top-6 rounded-lg" onClick={() => setPlaying(null)}>
            <X size={16} /> Fechar
          </Button>
        </div>
      )}

      {user && (
        <VideoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          video={editing}
          userId={user.id}
          onSaved={load}
        />
      )}
    </section>
  );
};

const VideoCard = ({
  video: v,
  index,
  src,
  isAdmin,
  onPlay,
  onEdit,
  onDelete,
}: {
  video: VideoRow;
  index: number;
  src?: string;
  isAdmin: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const pop = usePopIn<HTMLElement>();
  return (
    <article
      ref={pop.ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`${pop.className} group relative overflow-hidden rounded-lg border-2 border-border bg-background transition-all hover:border-primary`}
    >
      <div className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg bg-black" onClick={onPlay}>
        {src ? (
          <video src={`${src}#t=1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary shadow-flame">
            <Play className="ml-1 h-8 w-8 fill-current text-primary-foreground" />
          </div>
        </div>
        <span className="mono absolute left-4 top-4 rounded-lg bg-primary px-3 py-1 text-xs font-bold tracking-wider text-primary-foreground">
          {v.kind === "full" ? "PREGAÇÃO" : "CLIPE"}
        </span>
        {!v.published && (
          <span className="mono absolute right-4 top-4 rounded-lg bg-muted px-3 py-1 text-xs font-bold tracking-wider">
            RASCUNHO
          </span>
        )}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon" className="rounded-lg" onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Editar">
              <Pencil size={16} />
            </Button>
            <Button size="icon" variant="destructive" className="rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Apagar">
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="mb-2 font-display text-2xl tracking-wide transition-colors group-hover:text-primary">{v.title}</h3>
        {v.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{v.description}</p>}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{v.speaker ?? "FLAMA"}</span>
          {v.duration_label && (
            <span className="mono flex items-center gap-1.5"><Clock size={14} /> {v.duration_label}</span>
          )}
        </div>
      </div>
    </article>
  );
};

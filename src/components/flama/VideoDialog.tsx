import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  kind: string;
  duration_label: string | null;
  storage_path: string | null;
  external_url: string | null;
  published: boolean;
  published_at: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  video: VideoRow | null;
  userId: string;
  onSaved: () => void;
};

export const VideoDialog = ({ open, onOpenChange, video, userId, onSaved }: Props) => {
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("Léo Crocoli");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("clip");
  const [duration, setDuration] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(video?.title ?? "");
    setSpeaker(video?.speaker ?? "Léo Crocoli");
    setDescription(video?.description ?? "");
    setKind(video?.kind ?? "clip");
    setDuration(video?.duration_label ?? "");
    setExternalUrl(video?.external_url ?? "");
    setPublished(video?.published ?? true);
    setProgress(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, video]);

  const uploadResumable = (file: File, path: string) =>
    new Promise<void>(async (resolve, reject) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return reject(new Error("Sessão expirada"));
      const upload = new tus.Upload(file, {
        endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: "videos",
          objectName: path,
          contentType: file.type || "video/mp4",
          cacheControl: "3600",
        },
        chunkSize: 6 * 1024 * 1024,
        onError: reject,
        onProgress: (sent, total) => setProgress(Math.round((sent / total) * 100)),
        onSuccess: () => resolve(),
      });
      upload.findPreviousUploads().then((prev) => {
        if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
        upload.start();
      });
    });

  const save = async () => {
    if (!title.trim()) {
      toast({ title: "Dê um título ao vídeo", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let storagePath = video?.storage_path ?? null;
      const file = fileRef.current?.files?.[0];
      if (file) {
        const ext = file.name.split(".").pop() ?? "mp4";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        setProgress(0);
        await uploadResumable(file, path);
        if (video?.storage_path) await supabase.storage.from("videos").remove([video.storage_path]);
        storagePath = path;
      }

      const payload = {
        title: title.trim(),
        speaker: speaker.trim() || null,
        description: description.trim() || null,
        kind,
        duration_label: duration.trim() || null,
        external_url: externalUrl.trim() || null,
        storage_path: storagePath,
        published,
      };

      if (video) {
        const { error } = await supabase.from("videos").update(payload).eq("id", video.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert({ ...payload, created_by: userId });
        if (error) throw error;
      }
      toast({ title: video ? "Vídeo atualizado" : "Vídeo publicado" });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {video ? "EDITAR VÍDEO" : "NOVO VÍDEO / CLIPE"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Não tenha medo do fogo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Pregador</Label>
              <Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duração</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1 min / 3h 12min" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              {[
                { v: "clip", l: "Clipe / Short" },
                { v: "full", l: "Pregação completa" },
              ].map((o) => (
                <Button
                  key={o.v}
                  type="button"
                  variant={kind === o.v ? "default" : "secondary"}
                  className="rounded-lg"
                  onClick={() => setKind(o.v)}
                >
                  {o.l}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Arquivo de vídeo (sem limite de duração)</Label>
            <Input ref={fileRef} type="file" accept="video/*" className="rounded-lg" />
            {video?.storage_path && <p className="text-xs text-muted-foreground">Já existe um arquivo — envie outro só se quiser substituir.</p>}
          </div>
          <div className="space-y-2">
            <Label>Ou link externo (YouTube, Drive…)</Label>
            <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Publicado</Label>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
          {progress !== null && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mono text-xs text-muted-foreground">Enviando… {progress}%</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button className="rounded-xl" onClick={save} disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Salvando…</> : <><Upload size={16} /> Salvar</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

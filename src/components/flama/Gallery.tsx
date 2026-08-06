import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, ImagePlus, Loader2, Trash2, X } from "lucide-react";

type GalleryImage = {
  id: string;
  path: string;
  title: string | null;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export const Gallery = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, path, title, content_type, size_bytes, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar imagens", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = (data ?? []) as GalleryImage[];
    setImages(list);
    if (list.length) {
      const { data: signed } = await supabase.storage
        .from("gallery")
        .createSignedUrls(list.map((i) => i.path), 60 * 60 * 24);
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

  const onUpload = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    const list = Array.from(files);
    setUploading({ done: 0, total: list.length });
    let done = 0;
    for (const file of list) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
        cacheControl: "31536000",
      });
      if (upErr) {
        toast({ title: `Falha em ${file.name}`, description: upErr.message, variant: "destructive" });
      } else {
        const { error: dbErr } = await supabase.from("gallery_images").insert({
          path,
          title: file.name,
          content_type: file.type || null,
          size_bytes: file.size,
          uploaded_by: user.id,
        });
        if (dbErr) toast({ title: `Falha ao registrar ${file.name}`, description: dbErr.message, variant: "destructive" });
      }
      done += 1;
      setUploading({ done, total: list.length });
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
    toast({ title: "Upload concluído", description: `${done} arquivo(s) enviados.` });
    load();
  };

  const remove = async (img: GalleryImage) => {
    await supabase.storage.from("gallery").remove([img.path]);
    const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const download = async (img: GalleryImage) => {
    const { data, error } = await supabase.storage.from("gallery").download(img.path);
    if (error || !data) {
      toast({ title: "Erro ao baixar", description: error?.message ?? "", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = img.title ?? img.path.split("/").pop() ?? "flama.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="galeria" className="relative py-24 md:py-32">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-white">MOMENTS</h2>
          <p className="mono mt-3 text-xs uppercase tracking-widest text-white/70">
            Baixe as fotos na qualidade original
          </p>
        </div>

        {isAdmin && (
          <div className="mb-10 flex justify-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
            <Button
              className="rounded-full"
              disabled={!!uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <><Loader2 className="animate-spin" size={16} /> Enviando {uploading.done}/{uploading.total}</>
              ) : (
                <><ImagePlus size={16} /> Adicionar imagens</>
              )}
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-white/70">Carregando…</p>
        ) : images.length === 0 ? (
          <p className="text-center text-white/70">Nenhuma imagem por enquanto.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-3xl border-2 border-border bg-card"
              >
                <img
                  src={urls[img.path]}
                  alt={img.title ?? "FLAMA"}
                  loading="lazy"
                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setLightbox(img)}
                />
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" className="rounded-full" onClick={() => download(img)} aria-label="Baixar">
                    <Download size={16} />
                  </Button>
                  {isAdmin && (
                    <Button size="icon" variant="destructive" className="rounded-full" onClick={() => remove(img)} aria-label="Apagar">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={urls[lightbox.path]}
            alt={lightbox.title ?? "FLAMA"}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 flex gap-3">
            <Button className="rounded-full" onClick={(e) => { e.stopPropagation(); download(lightbox); }}>
              <Download size={16} /> Baixar original
            </Button>
            <Button variant="secondary" className="rounded-full" onClick={() => setLightbox(null)}>
              <X size={16} /> Fechar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};


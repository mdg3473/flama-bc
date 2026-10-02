import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Plus, Trash2, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TEAMS } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Member = {
  id: string; name: string; role: string | null;
  photo_path: string | null; testimony_path: string | null;
  photoUrl?: string; pdfUrl?: string;
};

const sign = async (path: string | null) => {
  if (!path) return undefined;
  const { data } = await supabase.storage.from("team").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
};

const Equipe = () => {
  const { slug = "" } = useParams();
  const team = TEAMS.find((t) => t.slug === slug);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Member | null>(null);

  useEffect(() => {
    if (!user) return setIsAdmin(false);
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("team_members").select("*").eq("team", slug).order("created_at");
    const list = await Promise.all((data ?? []).map(async (m) => ({
      ...m, photoUrl: await sign(m.photo_path), pdfUrl: await sign(m.testimony_path),
    })));
    setMembers(list);
  };
  useEffect(() => { load(); }, [slug]);

  const upload = async (file: File) => {
    const path = `${slug}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("team").upload(path, file);
    if (error) throw error;
    return path;
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Informe o nome");
    setSaving(true);
    try {
      const photo_path = photo ? await upload(photo) : null;
      const testimony_path = pdf ? await upload(pdf) : null;
      const { error } = await supabase.from("team_members").insert({
        team: slug, name: name.trim(), role: role.trim() || null, photo_path, testimony_path, created_by: user!.id,
      });
      if (error) throw error;
      toast.success("Adicionado!");
      setOpen(false); setName(""); setRole(""); setPhoto(null); setPdf(null);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const replacePdf = async (m: Member, file: File) => {
    try {
      const path = await upload(file);
      await supabase.from("team_members").update({ testimony_path: path }).eq("id", m.id);
      toast.success("Testemunho enviado"); setViewing(null); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (m: Member) => {
    if (!confirm(`Remover ${m.name}?`)) return;
    await supabase.from("team_members").delete().eq("id", m.id);
    setViewing(null); load();
  };

  if (!team) return <main className="container pt-32 text-center">Time não encontrado.</main>;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container pt-16 md:pt-24 pb-24">
        <Link to="/sobre" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8 font-display tracking-wider">
          <ArrowLeft size={20} /> Voltar
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <h1 className="font-display text-6xl md:text-8xl leading-[0.9]">
            TIME <span className="text-primary">{team.name.toUpperCase()}</span>
          </h1>
          {isAdmin && <Button onClick={() => setOpen(true)} className="rounded-xl"><Plus /> Adicionar pessoa</Button>}
        </div>

        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">Nenhuma pessoa adicionada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {members.map((m) => (
              <button key={m.id} onClick={() => setViewing(m)} className="group text-left">
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-flame">
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <User className="h-14 w-14 text-muted-foreground" />}
                </div>
                <h3 className="font-display text-2xl mt-3 group-hover:text-primary transition-colors">{m.name}</h3>
                {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
              </button>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-3xl">Nova pessoa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Função (ex: Líder)" value={role} onChange={(e) => setRole(e.target.value)} />
            <label className="block text-sm">Foto<Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} /></label>
            <label className="block text-sm">Testemunho (PDF)<Input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} /></label>
            <Button onClick={save} disabled={saving} className="w-full rounded-xl">{saving ? "Enviando..." : "Salvar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          {viewing && (
            <>
              <DialogHeader><DialogTitle className="font-display text-3xl">{viewing.name}</DialogTitle></DialogHeader>
              {viewing.photoUrl && <img src={viewing.photoUrl} alt={viewing.name} className="rounded-lg w-full max-h-80 object-cover" />}
              {viewing.pdfUrl ? (
                <Button asChild className="rounded-xl"><a href={viewing.pdfUrl} target="_blank" rel="noreferrer"><FileText /> Ler testemunho</a></Button>
              ) : <p className="text-muted-foreground text-sm">Testemunho em breve.</p>}
              {isAdmin && (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && replacePdf(viewing, e.target.files[0])} />
                    <span className="flex items-center justify-center gap-2 h-10 rounded-xl border cursor-pointer text-sm hover:bg-muted"><Upload size={16} /> Enviar PDF</span>
                  </label>
                  <Button variant="destructive" className="rounded-xl" onClick={() => remove(viewing)}><Trash2 /></Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Equipe;

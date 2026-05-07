import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CHANNELS } from "@/lib/channels";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
};

export const ProfileDialog = ({ open, onOpenChange, userId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [parents, setParents] = useState("");
  const [birth, setBirth] = useState("");
  const [grade, setGrade] = useState("6ano");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("full_name, parents_names, birth_date, grade, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setParents(data.parents_names ?? "");
          setBirth(data.birth_date ?? "");
          setGrade(data.grade ?? "6ano");
          setPhone(data.phone ?? "");
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [open, userId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let nextAvatar = avatarUrl;
    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (!upErr) {
        nextAvatar = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        parents_names: parents,
        birth_date: birth || null,
        grade,
        phone,
        avatar_url: nextAvatar,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) return toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    toast({ title: "Perfil atualizado" });
    setAvatarUrl(nextAvatar);
    setFile(null);
    onOpenChange(false);
  };

  const initials = fullName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const calcAge = (iso: string) => {
    if (!iso) return 0;
    const b = new Date(iso);
    const t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a;
  };
  const age = calcAge(birth);
  const isAdult = age > 18;
  const hideGrade = age > 19;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <form onSubmit={save} className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback>{initials || "?"}</AvatarFallback>
              </Avatar>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            {!isAdult && (
              <div>
                <Label>Nome dos pais</Label>
                <Input value={parents} onChange={(e) => setParents(e.target.value)} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nascimento</Label>
                <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
              </div>
              {!hideGrade && (
                <div>
                  <Label>Ano</Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div>
              <Label>Telefone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving && <Loader2 className="animate-spin" />} Salvar
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
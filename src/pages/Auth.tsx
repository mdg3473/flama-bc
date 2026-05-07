import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CHANNELS } from "@/lib/channels";
import { Flame, Loader2 } from "lucide-react";

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome").max(120),
  parents_names: z.string().trim().max(200).optional(),
  birth_date: z.string().min(1, "Informe a data"),
  grade: z.string().min(1, "Selecione o ano"),
  phone: z.string().trim().min(8, "Informe o telefone").max(30),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Informe uma senha").max(72),
});

const calcAge = (iso: string) => {
  if (!iso) return 0;
  const b = new Date(iso);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const Auth = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialTab = params.get("mode") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // signup
  const [fullName, setFullName] = useState("");
  const [parents, setParents] = useState("");
  const [birth, setBirth] = useState("");
  const [grade, setGrade] = useState<string>("6ano");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    document.title = "Entrar | Flama Comunidade";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/comunidade", { replace: true });
    });
  }, [nav]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPwd,
    });
    setLoading(false);
    if (error) return toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    nav("/comunidade", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = calcAge(birth);
    const isMinor = age > 0 && age < 18;
    if (isMinor && parents.trim().length < 2) {
      return toast({ title: "Verifique os campos", description: "Informe o nome dos pais", variant: "destructive" });
    }
    const parsed = signupSchema.safeParse({
      full_name: fullName, parents_names: parents || undefined, birth_date: birth, grade, phone, email, password: pwd,
    });
    if (!parsed.success) {
      return toast({ title: "Verifique os campos", description: parsed.error.issues[0].message, variant: "destructive" });
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pwd,
      options: {
        emailRedirectTo: `${window.location.origin}/comunidade`,
        data: { full_name: fullName, parents_names: parents, birth_date: birth, grade, phone },
      },
    });
    if (error || !data.user) {
      setLoading(false);
      return toast({ title: "Erro no cadastro", description: error?.message ?? "Tente novamente", variant: "destructive" });
    }

    if (avatar) {
      const ext = avatar.name.split(".").pop() ?? "jpg";
      const path = `${data.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatar, { upsert: true });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", data.user.id);
      }
    }

    setLoading(false);
    toast({ title: "Bem-vindo à Flama!", description: "Cadastro realizado." });
    nav("/", { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border-2 border-border p-8 relative">
        <div className="absolute -top-2 -left-2 right-2 bottom-2 border-2 border-primary -z-0" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-primary hover:opacity-80">
            <Flame size={20} /> <span className="mono text-xs tracking-widest">FLAMA</span>
          </Link>
          <h1 className="font-display text-4xl mb-6 leading-none">COMUNIDADE FLAMA</h1>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="le">Email</Label>
                  <Input id="le" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lp">Senha</Label>
                  <Input id="lp" type="password" required value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="animate-spin" />} Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <Label htmlFor="fn">Nome completo</Label>
                  <Input id="fn" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className={calcAge(birth) > 19 ? "" : "grid grid-cols-2 gap-3"}>
                  <div>
                    <Label htmlFor="bd">Nascimento</Label>
                    <Input id="bd" type="date" required value={birth} onChange={(e) => setBirth(e.target.value)} />
                  </div>
                  {!(calcAge(birth) > 19) && (
                    <div>
                      <Label htmlFor="gr">Ano</Label>
                      <select
                        id="gr"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {birth && calcAge(birth) > 0 && calcAge(birth) < 18 && (
                  <div>
                    <Label htmlFor="pn">Nome dos pais / responsáveis</Label>
                    <Input id="pn" required value={parents} onChange={(e) => setParents(e.target.value)} />
                  </div>
                )}
                <div>
                  <Label htmlFor="av">Foto de perfil</Label>
                  <Input id="av" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
                </div>
                <div>
                  <Label htmlFor="ph">Telefone</Label>
                  <Input id="ph" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(51) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="se">Email</Label>
                  <Input id="se" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sp">Senha</Label>
                  <Input id="sp" type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="animate-spin" />} Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Auth;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/flama/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Info = {
  id: string;
  product_name: string;
  product_slug: string;
  status: string;
  redeemed_at: string | null;
  created_at: string;
  buyer_name: string | null;
};

const Validar = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("validate_purchase", { _token: token });
    if (error || !data || data.length === 0) {
      setNotFound(true);
    } else {
      setInfo(data[0] as Info);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const handleRedeem = async () => {
    setRedeeming(true);
    const { data, error } = await supabase.rpc("redeem_purchase", { _token: token! });
    setRedeeming(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    if (data) { toast({ title: "Resgatado!" }); load(); }
    else toast({ title: "Já resgatado ou inválido", variant: "destructive" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-32 pb-32 container max-w-md">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : notFound ? (
          <div className="text-center py-20">
            <XCircle size={80} className="text-destructive mx-auto mb-4" />
            <h1 className="font-display text-4xl mb-2">QR INVÁLIDO</h1>
            <p className="text-muted-foreground">Este código não corresponde a nenhuma compra.</p>
          </div>
        ) : info && (
          <div className="text-center">
            {info.status === "redeemed" ? (
              <>
                <AlertTriangle size={80} className="text-yellow-500 mx-auto mb-4" />
                <h1 className="font-display text-4xl mb-2">JÁ RESGATADO</h1>
                <p className="text-muted-foreground">Este QR já foi utilizado em {info.redeemed_at && new Date(info.redeemed_at).toLocaleString("pt-BR")}.</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={80} className="text-green-600 mx-auto mb-4" />
                <h1 className="font-display text-4xl mb-2">PAGO ✓</h1>
                <p className="text-muted-foreground">Compra válida e confirmada.</p>
              </>
            )}
            <div className="mt-8 border-2 border-border rounded-lg p-6 text-left space-y-2">
              <div><span className="mono text-xs text-muted-foreground">PRODUTO</span><div className="font-display text-xl">{info.product_name}</div></div>
              {info.buyer_name && <div><span className="mono text-xs text-muted-foreground">COMPRADOR</span><div>{info.buyer_name}</div></div>}
              <div><span className="mono text-xs text-muted-foreground">DATA</span><div>{new Date(info.created_at).toLocaleString("pt-BR")}</div></div>
            </div>
            {isAdmin && info.status !== "redeemed" && (
              <Button onClick={handleRedeem} disabled={redeeming} className="mt-6 w-full">
                {redeeming ? <Loader2 className="animate-spin" /> : "Marcar como entregue"}
              </Button>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Validar;
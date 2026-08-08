import { useEffect, useState } from "react";
import { Navbar } from "@/components/flama/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

type Purchase = {
  id: string;
  token: string;
  product_name: string;
  status: string;
  redeemed_at: string | null;
  created_at: string;
};

const MeusQRCodes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<(Purchase & { qr: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("purchases")
        .select("id, token, product_name, status, redeemed_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const withQr = await Promise.all(
        (data ?? []).map(async (p) => ({
          ...p,
          qr: await QRCode.toDataURL(`${window.location.origin}/validar/${p.token}`, { width: 400, margin: 2 }),
        }))
      );
      setItems(withQr);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-32 pb-32 container">
        <h1 className="font-display text-5xl md:text-7xl leading-[0.9] text-primary mb-10 text-center">
          MEUS QR CODES
        </h1>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground">Você ainda não tem compras.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {items.map((p) => (
              <div key={p.id} className="border-2 border-border rounded-lg p-4 bg-card flex flex-col items-center">
                <img src={p.qr} alt={`QR ${p.product_name}`} className="w-full max-w-[240px] rounded-lg" />
                <h3 className="font-display text-lg mt-3 text-center">{p.product_name}</h3>
                <p className="mono text-[10px] text-muted-foreground break-all text-center mt-1">{p.token}</p>
                <span
                  className={`mt-2 mono text-[10px] px-3 py-1 rounded-full ${
                    p.status === "redeemed"
                      ? "bg-neutral-500 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {p.status === "redeemed" ? "RESGATADO" : "PAGO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MeusQRCodes;
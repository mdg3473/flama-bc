import tee from "@/assets/shop-tee.jpg";
import hoodie from "@/assets/shop-hoodie.jpg";
import burger from "@/assets/shop-burger.jpg";
import { ShoppingBag, Loader2 } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Product = { img: string; name: string; price: string; tag: string; slug: string; buyable?: boolean };

const products: Product[] = [
  { img: tee, name: "Camiseta FLAMA Fire", price: "R$ 10,00", tag: "NOVO", slug: "tee" },
  { img: hoodie, name: "Moletom Black Ember", price: "R$ 10,00", tag: "DROP", slug: "hoodie" },
  { img: burger, name: "Hamburger FLAMA", price: "R$ 10,00", tag: "", slug: "burger", buyable: true },
];

export const Shop = () => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBuy = async (p: Product) => {
    if (!user) {
      toast({ title: "Faça login para comprar", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setBuyingSlug(p.slug);
    const { data, error } = await supabase
      .from("purchases")
      .insert({ user_id: user.id, product_slug: p.slug, product_name: p.name })
      .select("token")
      .single();
    setBuyingSlug(null);
    if (error || !data) {
      toast({ title: "Erro ao processar compra", description: error?.message, variant: "destructive" });
      return;
    }
    const url = `${window.location.origin}/validar/${data.token}`;
    const png = await QRCode.toDataURL(url, { width: 512, margin: 2 });
    setQrToken(data.token);
    setQrDataUrl(png);
    toast({ title: "Compra confirmada!", description: "Seu QR code foi gerado." });
  };

  return (
  <section id="loja" className="relative py-24 md:py-32 overflow-hidden">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-white">
          FLAMA STORE
        </h2>
        <p className="text-white/80 mt-4 max-w-md mx-auto">
          Mercadoria oficial da FLAMA. Cada peça apoia diretamente os projetos sociais do ministério.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.name} product={p} index={i} onBuy={handleBuy} loading={buyingSlug === p.slug} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate("/meus-qrcodes")}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-white text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-background transition-colors"
        >
          Meus QR Codes
        </button>
      </div>
    </div>

    <Dialog open={!!qrDataUrl} onOpenChange={(o) => !o && setQrDataUrl(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Seu QR Code</DialogTitle>
          <DialogDescription>
            Apresente este QR na entrega. Ele também está salvo no seu perfil.
          </DialogDescription>
        </DialogHeader>
        {qrDataUrl && (
          <div className="flex flex-col items-center gap-4">
            <img src={qrDataUrl} alt="QR Code" className="w-full max-w-[280px] rounded-2xl" />
            <p className="mono text-xs text-muted-foreground break-all text-center">{qrToken}</p>
            <Button onClick={() => navigate("/meus-qrcodes")} className="w-full">
              Ver todos os meus QR codes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </section>
);
};

const ProductCard = ({
  product: p,
  index,
  onBuy,
  loading,
}: {
  product: Product;
  index: number;
  onBuy: (p: Product) => void;
  loading: boolean;
}) => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <div
      ref={pop.ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`${pop.className} group relative`}
    >
            <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-border bg-card group-hover:border-primary transition-colors">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {p.tag && (
                <span className="absolute top-4 left-4 mono text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold tracking-wider">
                  {p.tag}
                </span>
              )}
              <button
                onClick={() => p.buyable && onBuy(p)}
                disabled={loading || !p.buyable}
                aria-label={p.buyable ? `Comprar ${p.name}` : "Indisponível"}
                className="absolute bottom-4 right-4 h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              </button>
            </div>
            <div className="pt-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl tracking-wide text-white">{p.name}</h3>
              <span className="mono text-white font-bold">{p.price}</span>
            </div>
    </div>
  );
};

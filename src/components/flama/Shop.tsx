import tee from "@/assets/shop-tee.jpg";
import hoodie from "@/assets/shop-hoodie.jpg";
import cap from "@/assets/shop-cap.jpg";
import { ShoppingBag } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";

const products = [
  { img: tee, name: "Camiseta FLAMA Fire", price: "R$ 89,90", tag: "NOVO" },
  { img: hoodie, name: "Moletom Black Ember", price: "R$ 199,90", tag: "DROP" },
  { img: cap, name: "Boné Logo Bordado", price: "R$ 79,90", tag: "" },
];

export const Shop = () => (
  <section id="loja" className="relative py-24 md:py-32 overflow-hidden">
    <div className="container">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <div>
          <div className="mono text-xs text-primary tracking-[0.4em] mb-4">/ 05 — LOJA</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
            VESTE <span className="text-flame">A CHAMA</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md">
            Mercadoria oficial da FLAMA. Cada peça apoia diretamente os projetos sociais do ministério.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.name} product={p} index={i} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href="#"
          className="inline-flex items-center gap-3 px-8 py-4 border-2 border-foreground text-foreground font-bold uppercase tracking-widest text-sm hover:bg-foreground hover:text-background transition-colors"
        >
          Ver loja completa
        </a>
      </div>
    </div>
  </section>
);

const ProductCard = ({ product: p, index }: { product: typeof products[number]; index: number }) => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <div
      ref={pop.ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`${pop.className} group relative`}
    >
            <div className="relative aspect-square overflow-hidden border-2 border-border bg-card group-hover:border-primary transition-colors">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {p.tag && (
                <span className="absolute top-4 left-4 mono text-xs px-3 py-1 bg-primary text-primary-foreground font-bold tracking-wider">
                  {p.tag}
                </span>
              )}
              <button className="absolute bottom-4 right-4 h-12 w-12 bg-foreground text-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <ShoppingBag size={18} />
              </button>
            </div>
            <div className="pt-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl tracking-wide">{p.name}</h3>
              <span className="mono text-primary font-bold">{p.price}</span>
            </div>
    </div>
  );
};

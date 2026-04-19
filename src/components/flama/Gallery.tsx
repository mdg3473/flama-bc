import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

const items = [
  { img: g1, label: "Encontro de Verão", span: "md:col-span-2 md:row-span-2" },
  { img: g2, label: "Noite de Adoração", span: "" },
  { img: g3, label: "Célula Conectados", span: "" },
  { img: g4, label: "Fogueira Santa", span: "md:col-span-2" },
];

export const Gallery = () => (
  <section id="galeria" className="relative py-24 md:py-32 bg-card/40 border-y border-border">
    <div className="container">
      <div className="mb-14">
        <div className="mono text-xs text-primary tracking-[0.4em] mb-4">/ 04 — GALERIA</div>
        <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
          MOMENTOS <span className="text-flame">QUE MARCAM</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
        {items.map((it, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden border-2 border-border hover:border-primary cursor-pointer ${it.span}`}
          >
            <img
              src={it.img}
              alt={it.label}
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
              <div className="mono text-[10px] text-primary tracking-widest mb-1">0{i + 1}</div>
              <div className="font-display text-xl md:text-2xl tracking-wide">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

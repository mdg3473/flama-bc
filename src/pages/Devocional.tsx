import { Navbar } from "@/components/flama/Navbar";
import bibleStickers from "@/assets/bible-stickers.jpg";
import devocionalEp02 from "@/assets/devocional-ep02.pdf.asset.json";

const devocionais = [
  {
    id: 1,
    title: "Farmando Aura com o Apóstolo Paulo",
    subtitle: "Ep. 02 — Vivendo pelo Espírito",
    href: devocionalEp02.url,
  },
];

const Devocional = () => {
  return (
    <main className="relative min-h-screen text-neutral-900">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bibleStickers})` }}
      />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-white/40" />
      <link rel="preload" as="image" href={bibleStickers} />
      <Navbar />
      <section className="pt-32 pb-16">
        <div className="container">
          <h1 className="font-display text-5xl md:text-7xl leading-[0.9] text-center text-primary mb-10 drop-shadow">
            DEVOCIONAL
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl text-neutral-900 mb-6 tracking-wide">
            DEVOCIONAIS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {devocionais.map((d) => (
              <a
                key={d.id}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-2 border-neutral-900 p-6 hover:bg-primary hover:text-white transition-colors"
              >
                <div className="mono text-[10px] tracking-widest text-neutral-500 group-hover:text-white mb-3">
                  PDF · DEVOCIONAL
                </div>
                <h3 className="font-display text-xl leading-tight mb-2">{d.title}</h3>
                <p className="text-sm text-neutral-700 group-hover:text-white">{d.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Devocional;
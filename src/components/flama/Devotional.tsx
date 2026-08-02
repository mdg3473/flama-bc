import { Calendar } from "lucide-react";
import { usePopIn } from "@/hooks/usePopIn";
import bibleStickers from "@/assets/bible-stickers.jpg";

export const Devotional = () => {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const pop = usePopIn<HTMLDivElement>();

  return (
    <section id="devocional" className="relative py-24 md:py-32 overflow-hidden bg-white text-neutral-900">
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Bible image left, blended */}
          <div className="relative">
            <img
              src={bibleStickers}
              alt="Bíblia com adesivos"
              className="w-full h-auto object-cover mix-blend-multiply rounded-3xl"
            />
          </div>

          {/* Text right-bottom */}
          <div ref={pop.ref} className={`${pop.className} relative flex flex-col justify-end`}>
            <div className="ml-auto max-w-xl text-right">
              <div className="flex items-center justify-end gap-2 mono text-[10px] text-neutral-500 mb-4 uppercase tracking-widest">
                <Calendar size={14} /> {today}
              </div>
              <div className="mono text-xs text-white bg-primary rounded-full inline-block px-3 py-1 mb-3">SALMOS 27:1</div>
              <p className="font-display text-2xl md:text-3xl leading-tight mb-6 text-primary">
                "O Senhor é a minha luz e a minha salvação; a quem temerei?"
              </p>
              <h3 className="font-display text-lg tracking-wide mb-2 text-primary">REFLEXÃO</h3>
              <p className="text-neutral-700 leading-relaxed text-sm mb-4">
                Tem dia que tudo escurece. E é exatamente nesse breu que Davi escreve:
                <em> Deus é luz</em>. Quem caminha com Ele não tropeça no escuro.
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                <a href="#" className="mono text-[10px] px-4 py-2 rounded-full bg-neutral-900 text-white font-bold tracking-widest hover:bg-primary transition-colors">
                  ← ONTEM
                </a>
                <a href="#" className="mono text-[10px] px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold tracking-widest hover:bg-primary-glow transition-colors">
                  ARQUIVO COMPLETO
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

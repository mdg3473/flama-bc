import flamaGroup from "@/assets/flama-group.png";
import { usePopIn } from "@/hooks/usePopIn";
import { useEffect, useRef, useState } from "react";

export const About = () => {
  const head = usePopIn<HTMLHeadingElement>();
  const text = usePopIn<HTMLDivElement>();
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = imgWrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start moving when the image enters the viewport, stop when it leaves the top
      const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
      // Translate upward up to 140px as the user scrolls past it
      setOffset(progress * 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
  <section id="sobre" className="relative pt-24 md:pt-32 pb-0 overflow-hidden">
    {/* Dark overlay for background readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/10 pointer-events-none" />

    <div className="container relative">
      <h2 ref={head.ref} className={`${head.className} font-display text-5xl md:text-7xl leading-[0.9] mb-12 text-center text-white`}>
        QUEM NÓS <span className="text-primary">SOMOS</span>
      </h2>
      <div ref={text.ref} className={`${text.className} text-white text-lg leading-relaxed mb-10 max-w-3xl mx-auto space-y-5`}>
        <p>A gente vive num mundo cheio de vozes.</p>
        <p>Todo mundo quer dizer quem você é, o que você tem que ser, pra onde você tem que ir.</p>
        <p>
          Mas Jesus disse:<br />
          <em>"As minhas ovelhas ouvem a minha voz; eu as conheço e elas me seguem." (João 10:27)</em>
        </p>
        <p>O Flama existe por isso.</p>
        <p>
          Aqui, a gente aprende a reconhecer a voz do Bom Pastor no meio do barulho. A gente acredita que fé não é hype, não é regra vazia, não é coisa de um dia só. É relacionamento. É caminhada. É vida real.
        </p>
        <p>Jesus não veio roubar nossa juventude. Ele veio dar vida em abundância.</p>
        <p>
          Aqui tem espaço para perguntas, para riso, para choro, para amizade verdadeira e, principalmente, para crescermos juntos em amor por Jesus.
        </p>
        <p className="font-display text-2xl">O Bom Pastor está chamando.</p>
        <p className="font-display text-2xl text-primary">E o Flama é sobre responder.</p>
      </div>
    </div>

    {/* Full-bleed image stretched edge-to-edge, flush with next section */}
    <div
      ref={imgWrapRef}
      className="w-screen relative left-1/2 -translate-x-1/2 mt-8 block bg-primary overflow-hidden rounded-t-[2.5rem]"
    >
      <img
        src={flamaGroup}
        alt="Galera FLAMA"
        style={{ transform: `translate3d(0, ${-offset}px, 0)`, willChange: "transform" }}
        className="w-full h-[420px] md:h-[580px] object-cover block align-bottom rounded-t-[2.5rem] transition-transform duration-100 ease-out"
      />
    </div>
  </section>
);
};

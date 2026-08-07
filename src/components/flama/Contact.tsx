import { Instagram, Youtube, MessageCircle, MapPin } from "lucide-react";
import flamaLogo from "@/assets/flama-logo.png";
import { usePopIn } from "@/hooks/usePopIn";

const ContactCard = ({
  index,
  icon: Icon,
  title,
  children,
}: {
  index: number;
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) => {
  const pop = usePopIn<HTMLDivElement>();
  return (
    <div
      ref={pop.ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`${pop.className} p-8 rounded-3xl border-2 border-card bg-card hover:border-primary transition-colors`}
    >
      <Icon className="h-8 w-8 text-primary mb-4" />
      <h3 className="font-display text-2xl tracking-wide mb-2 text-primary">{title}</h3>
      <div className="text-primary/80">{children}</div>
    </div>
  );
};

export const Contact = () => {
  const head = usePopIn<HTMLDivElement>();
  const socials = usePopIn<HTMLDivElement>();
  return (
  <section id="contato" className="relative py-24 md:py-32 overflow-hidden bg-primary text-white">
    <div className="container relative">
      <div ref={head.ref} className={`${head.className} text-center mb-16`}>
        <h2 className="font-display text-6xl md:text-9xl leading-[0.85] text-white">
          É US GURI DO FLAMA
        </h2>
        <p className="text-white/80 mt-8 max-w-xl mx-auto text-lg">
          Toda sexta-feira à partir das 19:30
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <ContactCard index={0} icon={MapPin} title="Onde nos encontrar">
          Rua 18 de novembro, 135<br />
          Porto Alegre, Rio Grande do Sul 90240-040
        </ContactCard>
        <ContactCard index={1} icon={MessageCircle} title="Fala com a gente">
          WhatsApp: (11) 99999-9999<br />
          contato@flama.org
        </ContactCard>
      </div>

      <div ref={socials.ref} className={`${socials.className} mt-16 flex justify-center gap-4`}>
        {[Instagram, Youtube, MessageCircle].map((Icon, i) => (
          <a
            key={i}
            href="#"
            aria-label="rede social"
            className="h-14 w-14 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary transition-all"
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </div>

    {/* Footer */}
    <footer className="container mt-24 pt-8 border-t border-white/25 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src={flamaLogo} alt="FLAMA" width={80} height={48} className="h-8 w-auto object-contain [filter:brightness(0)_invert(1)]" />
        <span className="mono text-xs text-white/80 tracking-widest">
          © {new Date().getFullYear()} FLAMA · MINISTÉRIO JOVEM
        </span>
      </div>
      <span className="mono text-xs text-white/80 tracking-widest">
        FEITO COM FOGO 🔥
      </span>
    </footer>
  </section>
);
};

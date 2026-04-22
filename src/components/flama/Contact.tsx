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
      className={`${pop.className} p-8 border-2 border-border bg-background hover:border-primary transition-colors`}
    >
      <Icon className="h-8 w-8 text-primary mb-4" />
      <h3 className="font-display text-2xl tracking-wide mb-2">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
};

export const Contact = () => (
  <section id="contato" className="relative py-24 md:py-32 bg-gradient-to-b from-background to-card overflow-hidden">
    <div className="absolute inset-0 bg-gradient-radial opacity-50" />
    <div className="container relative">
      <div className="text-left mb-16">
        <h2 className="font-display text-6xl md:text-9xl leading-[0.85]">
          A CHAMA <br />
          <span className="text-flame">PRECISA DE</span> <br />
          <span className="glitch">VOCÊ.</span>
        </h2>
        <p className="text-muted-foreground mt-8 max-w-xl text-lg">
          Toda quarta às 19h30 e domingo às 18h. Traz um amigo. Vem como você é.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <ContactCard index={0} icon={MapPin} title="Onde nos encontrar">
          Igreja Sede — Rua das Acácias, 123<br />
          Vila Esperança · Sua Cidade
        </ContactCard>
        <ContactCard index={1} icon={MessageCircle} title="Fala com a gente">
          WhatsApp: (11) 99999-9999<br />
          contato@flama.org
        </ContactCard>
      </div>

      <div className="mt-16 flex justify-center gap-4">
        {[Instagram, Youtube, MessageCircle].map((Icon, i) => (
          <a
            key={i}
            href="#"
            aria-label="rede social"
            className="h-14 w-14 flex items-center justify-center border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </div>

    {/* Footer */}
    <footer className="container mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src={flamaLogo} alt="FLAMA" width={80} height={48} className="h-8 w-auto object-contain" />
        <span className="mono text-xs text-muted-foreground tracking-widest">
          © {new Date().getFullYear()} FLAMA · MINISTÉRIO JOVEM
        </span>
      </div>
      <span className="mono text-xs text-muted-foreground tracking-widest">
        FEITO COM FOGO 🔥
      </span>
    </footer>
  </section>
);

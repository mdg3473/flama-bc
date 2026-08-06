import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import introVideo from "@/assets/intro-estacoes.mp4.asset.json";

const PASSWORD = "ESTAÇÕES";

interface GateProps {
  onUnlock: () => void;
}

const Gate = ({ onUnlock }: GateProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().toUpperCase() === PASSWORD) {
      sessionStorage.setItem("flama_gate", "1");
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={introVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
        <form onSubmit={submit} className="w-full max-w-sm flex flex-col items-center gap-4">
          <div className="relative w-full">
            <Input
              autoFocus
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Insira a senha"
              className="text-center bg-white/10 backdrop-blur-md border-white/40 text-white placeholder:text-white/70 h-12 text-lg tracking-widest pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-white text-sm">Senha incorreta</p>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    </main>
  );
};

export default Gate;
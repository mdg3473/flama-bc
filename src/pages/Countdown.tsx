import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import flamaLogo from "@/assets/flama-logo.png";

const TARGET = new Date("2026-09-04T00:00:00").getTime();

const calc = () => {
  const diff = Math.max(0, TARGET - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { hours, minutes, seconds };
};

const Countdown = () => {
  const [t, setT] = useState(calc());

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-primary text-primary-foreground">
      <Link to="/home" aria-label="FLAMA" className="absolute top-6 left-6 z-10">
        <img
          src={flamaLogo}
          alt="FLAMA"
          className="h-14 md:h-16 w-auto object-contain [filter:brightness(0)_invert(1)]"
        />
      </Link>
      <div className="flex items-center justify-center w-full h-full px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="uppercase tracking-[0.3em] text-sm md:text-base opacity-90">
            Contagem regressiva
          </p>
          <div className="flex items-start gap-4 md:gap-10 font-bold tabular-nums">
            {[
              { label: "Horas", value: t.hours },
              { label: "Minutos", value: t.minutes },
              { label: "Segundos", value: t.seconds },
            ].map((item, i) => (
              <div key={item.label} className="flex items-start gap-4 md:gap-10">
                <div className="flex flex-col items-center">
                  <span className="text-6xl md:text-9xl leading-none">{pad(item.value)}</span>
                  <span className="mt-2 text-xs md:text-sm uppercase tracking-widest opacity-80">
                    {item.label}
                  </span>
                </div>
                {i < 2 && <span className="text-6xl md:text-9xl leading-none opacity-60">:</span>}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm md:text-base opacity-90">Até 4 de setembro</p>
        </div>
      </div>
    </main>
  );
};

export default Countdown;
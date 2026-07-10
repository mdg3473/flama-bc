import { useEffect, useRef, useState } from "react";

/**
 * Pop-in effect: element fades + scales + slides up when it enters the viewport.
 * Inspired by the original FLAMA HTML site cards.
 */
export const usePopIn = <T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.2 }
) => {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return {
    ref,
    className: `pop-in ${active ? "pop-in-active" : ""}`,
  };
};

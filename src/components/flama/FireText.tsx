import { useState } from "react";

interface Props {
  text: string;
  className?: string;
}

/**
 * Each letter wiggles like a flame on hover.
 * The wave delay is staggered per letter for an organic fire effect.
 */
export const FireText = ({ text, className = "" }: Props) => {
  const [hovering, setHovering] = useState(false);

  return (
    <span
      className={`inline-flex ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block origin-bottom"
          style={{
            animation: hovering
              ? `fire-dance 0.55s ease-in-out ${i * 0.07}s infinite alternate`
              : "none",
            transformOrigin: "50% 100%",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

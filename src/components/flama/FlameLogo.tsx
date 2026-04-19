interface Props {
  className?: string;
}

export const FlameLogo = ({ className = "h-8 w-8" }: Props) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M32 4c2 8-6 12-6 22 0 6 4 10 4 14 0 3-2 6-2 6s10-2 14-10c4-8-2-14 0-22 0 0 6 6 6 16 0 12-8 24-20 24S8 44 8 32c0-14 14-18 18-28 2 4 4 0 6 0z"
      fill="url(#flame-gradient)"
    />
    <defs>
      <linearGradient id="flame-gradient" x1="0" y1="64" x2="0" y2="0">
        <stop offset="0%" stopColor="hsl(8 90% 50%)" />
        <stop offset="50%" stopColor="hsl(16 100% 55%)" />
        <stop offset="100%" stopColor="hsl(45 100% 60%)" />
      </linearGradient>
    </defs>
  </svg>
);

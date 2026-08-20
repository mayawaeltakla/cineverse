import { useMemo } from "react";

interface Props {
  title: string;
  seed: number;
  className?: string;
}

const PALETTES: [string, string, string][] = [
  ["#241b34", "#e4572e", "#f2b33d"],
  ["#132430", "#4ed9c6", "#f6c453"],
  ["#2b1524", "#ff7a50", "#ffd98a"],
  ["#1a2415", "#8ceadb", "#f2b33d"],
  ["#301c36", "#f2b33d", "#4ed9c6"],
  ["#221414", "#e4572e", "#8ceadb"],
];

const GLYPHS = [
  // بكرة فيلم
  (c: string) => (
    <g stroke={c} strokeWidth="5" fill="none">
      <circle cx="100" cy="100" r="52" />
      <circle cx="100" cy="100" r="9" fill={c} />
      <circle cx="100" cy="66" r="11" />
      <circle cx="100" cy="134" r="11" />
      <circle cx="66" cy="100" r="11" />
      <circle cx="134" cy="100" r="11" />
    </g>
  ),
  // نجمة سينما
  (c: string) => (
    <path
      d="M100 45l16 38 41 4-31 27 9 41-35-22-35 22 9-41-31-27 41-4z"
      fill="none"
      stroke={c}
      strokeWidth="5"
      strokeLinejoin="round"
    />
  ),
  // عين كاميرا
  (c: string) => (
    <g stroke={c} strokeWidth="5" fill="none">
      <circle cx="100" cy="100" r="46" />
      <circle cx="100" cy="100" r="20" />
      <path d="M40 54h120M40 146h120" strokeLinecap="round" />
    </g>
  ),
  // هلال + شمس
  (c: string) => (
    <g fill={c}>
      <path d="M118 52a55 55 0 100 96 44 44 0 110-96z" opacity="0.9" />
      <circle cx="140" cy="66" r="10" />
    </g>
  ),
];

/** بوستر تصميمي (SVG) للأفلام التي لا تملك صورة — هوية بصرية موحّدة */
export default function PosterArt({ title, seed, className = "" }: Props) {
  const [bg, a, b] = PALETTES[seed % PALETTES.length];
  const glyph = GLYPHS[seed % GLYPHS.length];
  const stripes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: 18 + i * 30 + ((seed * 7) % 12),
        w: 6 + ((seed + i) % 3) * 4,
        o: 0.06 + ((seed + i) % 4) * 0.03,
      })),
    [seed]
  );

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${bg} 0%, #0b0910 100%)` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        {stripes.map((s, i) => (
          <rect key={i} x={s.x} y="0" width={s.w} height="300" fill={b} opacity={s.o} />
        ))}
        <g transform="translate(0,40)">{glyph(a)}</g>
        <circle cx="100" cy="100" r="88" fill="none" stroke={a} strokeWidth="1.5" opacity="0.25" />
        <circle cx="100" cy="100" r="104" fill="none" stroke={a} strokeWidth="1" opacity="0.12" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-night-950/95 via-night-950/50 to-transparent">
        <p className="font-display font-bold text-cream/90 text-sm leading-snug line-clamp-2">
          {title}
        </p>
        <div className="mt-1.5 h-[3px] w-8" style={{ background: a }} />
      </div>
      <span className="absolute top-2 left-2 font-display text-[10px] tracking-widest text-cream/40" dir="ltr">
        CV·{String(seed + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

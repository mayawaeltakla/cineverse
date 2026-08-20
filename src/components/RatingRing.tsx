import { useEffect, useState } from "react";

interface Props {
  value: number; // من ١٠
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const colorFor = (v: number) =>
  v >= 7.5 ? "#4ED9C6" : v >= 6 ? "#F2B33D" : v >= 4.5 ? "#FF7A50" : "#E4572E";

/** حلقة تقييم SVG تتحرك عند الظهور */
export default function RatingRing({
  value,
  size = 46,
  strokeWidth = 3.5,
  showLabel = true,
}: Props) {
  const [progress, setProgress] = useState(0);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const color = colorFor(value);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = Math.max(0, Math.min(10, value)) / 10;
    if (reduce) {
      setProgress(target);
      return;
    }
    const t = setTimeout(() => setProgress(target), 120);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`التقييم ${value.toFixed(1)} من ١٠`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="rgba(11,9,16,0.72)"
          stroke="rgba(245,237,222,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold"
          style={{ fontSize: size * 0.3, color }}
          dir="ltr"
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

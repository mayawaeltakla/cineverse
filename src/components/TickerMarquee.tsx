import type { Movie } from "../types";

interface Props {
  movies: Movie[];
  live: boolean;
  userName?: string | null;
}

/** لافتة سينما متحركة — شريط «الآن يعرض» */
export default function TickerMarquee({ movies, live, userName }: Props) {
  const items = movies.length
    ? movies.slice(0, 12).map((m) => m.title)
    : ["كثبان النار", "جزر السماء", "ظل المطر", "نيون ٢٠٩٩", "منارة الغربان"];

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {userName && (
        <span className="flex items-center">
          <span className="px-5 font-display text-sm font-semibold text-gold-300 md:text-base">
            أهلًا {userName} — قاعة العرض جاهزة
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-gold-500/80" fill="currentColor" aria-hidden="true">
            <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" />
          </svg>
        </span>
      )}
      {items.map((t, i) => (
        <span key={`${key}-${i}`} className="flex items-center">
          <span className="px-5 font-display text-sm font-semibold tracking-wide text-cream/70 md:text-base">
            {t}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-gold-500/80" fill="currentColor" aria-hidden="true">
            <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" />
          </svg>
        </span>
      ))}
      <span className="px-5 font-display text-sm font-semibold text-ember-400">
        {live ? "بث مباشر من TMDB" : "وضع العرض التجريبي"}
      </span>
      <svg width="12" height="12" viewBox="0 0 12 12" className="text-ember-500/80" fill="currentColor" aria-hidden="true">
        <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" />
      </svg>
    </div>
  );

  return (
    <div className="marquee-paused relative overflow-hidden border-y border-cream/10 bg-night-900/80 py-2.5">
      <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-night-950 to-transparent" />
      <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-night-950 to-transparent" />
      <div className="marquee-track flex w-max animate-marquee" dir="ltr">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

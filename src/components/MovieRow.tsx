import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard, { type CardData } from "./MovieCard";
import type { SavedMovie } from "../types";

interface Props {
  title: string;
  subtitle?: string;
  accent?: "gold" | "ember" | "mint";
  movies: (CardData | SavedMovie)[];
  viewAllTo?: string;
  idPrefix: string;
}

const ACCENTS = {
  gold: "bg-gold-500",
  ember: "bg-ember-500",
  mint: "bg-mint-400",
};

export default function MovieRow({
  title,
  subtitle,
  accent = "gold",
  movies,
  viewAllTo,
  idPrefix,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    // في RTL الاتجاه البصري الأمامي = scrollLeft سالب
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={`h-7 w-1.5 rounded-full ${ACCENTS[accent]}`} />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-cream">
              {title}
            </h2>
          </div>
          {subtitle && <p className="mt-1 pr-[18px] text-sm text-dust">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="hidden sm:inline-block rounded-full border border-cream/15 px-4 py-1.5 text-xs text-cream/80 transition-all hover:border-gold-500 hover:text-gold-300"
            >
              عرض الكل
            </Link>
          )}
          <button
            onClick={() => scroll(1)}
            aria-label="تمرير لليمين"
            className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-cream/70 transition-all hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300 active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => scroll(-1)}
            aria-label="تمرير لليسار"
            className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-cream/70 transition-all hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300 active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scroller}
          className="row-fade no-scrollbar -mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1"
        >
          {movies.map((mv, i) => (
            <MovieCard key={`${idPrefix}-${mv.id}`} movie={mv} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

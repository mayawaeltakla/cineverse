import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FilterX, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { MovieGrid } from "../components/MovieCard";
import { ErrorState } from "../components/Feedback";
import { GridSkeleton } from "../components/Skeletons";
import { useDiscover } from "../hooks/queries";
import { allGenres } from "../lib/tmdb";
import { fmtInt } from "../lib/format";

const SORTS = [
  { value: "popularity.desc", label: "الأكثر شعبية" },
  { value: "vote_average.desc", label: "الأعلى تقييمًا" },
  { value: "primary_release_date.desc", label: "الأحدث إصدارًا" },
  { value: "revenue.desc", label: "الأعلى إيرادًا" },
];

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

export default function Discover() {
  const [params, setParams] = useSearchParams();

  const genres = useMemo(
    () =>
      (params.get("genres") ?? "")
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite),
    [params]
  );
  const year = params.get("year") ?? "";
  const sort = params.get("sort") ?? "popularity.desc";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const query = useDiscover({ genres, year, sort, page });

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    setParams(next, { replace: false });
  };

  const toggleGenre = (id: number) => {
    const next = genres.includes(id)
      ? genres.filter((g) => g !== id)
      : [...genres, id];
    update({ genres: next.join(",") });
  };

  const hasFilters = genres.length > 0 || year !== "";
  const data = query.data;

  const pages = useMemo(() => {
    if (!data) return [];
    const total = Math.min(data.totalPages, 12);
    const start = Math.max(1, Math.min(page - 2, Math.max(1, total - 4)));
    return Array.from({ length: Math.min(5, total) }, (_, i) => start + i).filter(
      (p) => p >= 1 && p <= total
    );
  }, [data, page]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-32"
    >
      <header className="mb-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold-400">
          <SlidersHorizontal size={15} />
          قاعة الاستكشاف
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-extrabold text-cream md:text-5xl">
            تصفّح الكون <span className="text-outline-gold">كلّه</span>
          </h1>
          {data && (
            <p className="font-display text-sm text-dust">
              <span className="text-gold-300">{fmtInt(data.totalResults)}</span> فيلمًا
              {genres.length > 0 && ` في ${genres.length} نوعًا`}
            </p>
          )}
        </div>
      </header>

      {/* شريط الفلاتر */}
      <div className="sticky top-[108px] z-30 -mx-5 mb-8 border-y border-cream/8 bg-night-950/90 px-5 py-3 backdrop-blur-xl lg:top-[72px] md:-mx-8 md:px-8">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {allGenres.map((g) => {
            const active = genres.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                  active
                    ? "border-gold-500 bg-gold-500 text-night-950 shadow-[0_4px_18px_-4px_rgba(242,179,61,0.6)]"
                    : "border-cream/15 bg-night-900/70 text-cream/75 hover:border-gold-500/60 hover:text-gold-300"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => update({ year: e.target.value })}
            className="rounded-full border border-cream/15 bg-night-900 px-4 py-1.5 text-xs text-cream outline-none transition-colors focus:border-gold-500"
            aria-label="سنة الإصدار"
          >
            <option value="">كل السنوات</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-full border border-cream/15 bg-night-900 px-4 py-1.5 text-xs text-cream outline-none transition-colors focus:border-gold-500"
            aria-label="الترتيب"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => update({ genres: "", year: "" })}
              className="flex items-center gap-1.5 rounded-full border border-ember-500/40 bg-ember-500/10 px-4 py-1.5 text-xs font-semibold text-ember-300 transition-all hover:bg-ember-500/20 active:scale-95"
            >
              <FilterX size={13} />
              مسح الفلاتر
            </button>
          )}
          {query.isFetching && (
            <span className="ms-auto flex items-center gap-2 text-xs text-dust">
              <span className="h-2 w-2 animate-blink rounded-full bg-gold-500" />
              يُحدّث…
            </span>
          )}
        </div>
      </div>

      {/* النتائج */}
      {query.isLoading ? (
        <GridSkeleton count={12} />
      ) : query.isError ? (
        <ErrorState message="تعذّر جلب النتائج" onRetry={() => query.refetch()} />
      ) : data && data.results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-night-900/50 px-6 py-16 text-center">
          <p className="font-display text-2xl font-bold text-cream">القاعة فارغة هنا</p>
          <p className="max-w-md text-sm text-dust">
            لا أفلام تطابق هذه التوليفة من الفلاتر. جرّب توسيع السنوات أو إزالة
            بعض الأنواع.
          </p>
          <button
            onClick={() => update({ genres: "", year: "" })}
            className="rounded-full bg-gold-500 px-6 py-2.5 font-display text-sm font-bold text-night-950 transition-all hover:bg-gold-400 active:scale-95"
          >
            عرض كل الأفلام
          </button>
        </div>
      ) : data ? (
        <>
          <MovieGrid movies={data.results} idPrefix={`d${page}`} />
          {data.totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="التنقل بين الصفحات">
              <button
                onClick={() => update({ page: String(page - 1) })}
                disabled={page <= 1}
                aria-label="الصفحة السابقة"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/75 transition-all hover:border-gold-500 hover:text-gold-300 active:scale-90 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => update({ page: String(p) })}
                  className={`h-10 min-w-10 rounded-full px-3 font-display text-sm font-bold transition-all active:scale-90 ${
                    p === page
                      ? "bg-gold-500 text-night-950 shadow-[0_4px_18px_-4px_rgba(242,179,61,0.6)]"
                      : "border border-cream/15 text-cream/75 hover:border-gold-500 hover:text-gold-300"
                  }`}
                  dir="ltr"
                >
                  {fmtInt(p)}
                </button>
              ))}
              <button
                onClick={() => update({ page: String(page + 1) })}
                disabled={page >= data.totalPages}
                aria-label="الصفحة التالية"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/75 transition-all hover:border-gold-500 hover:text-gold-300 active:scale-90 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </nav>
          )}
        </>
      ) : null}
    </motion.div>
  );
}

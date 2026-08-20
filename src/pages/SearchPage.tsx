import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { MovieGrid } from "../components/MovieCard";
import { ErrorState } from "../components/Feedback";
import { GridSkeleton } from "../components/Skeletons";
import { useSearch } from "../hooks/queries";
import { fmtInt } from "../lib/format";

const SUGGESTIONS = [
  "كثبان النار",
  "خيال علمي",
  "ليان حداد",
  "رعب",
  "نيون",
  "دراما",
  "مغامرة",
  "منارة",
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const [input, setInput] = useState(q);

  useEffect(() => setInput(q), [q]);

  // تأخير الكتابة قبل إرسال الاستعلام
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim() !== q) {
        const next = new URLSearchParams();
        if (input.trim()) next.set("q", input.trim());
        setParams(next, { replace: true });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [input, q, setParams]);

  const query = useSearch(q, page);
  const searching = q.trim().length > 1;

  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-32"
    >
      <header className="mb-8">
        <p className="text-sm font-semibold text-mint-300">آلة البحث</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold text-cream md:text-5xl">
          عن ماذا <span className="text-outline-gold">تبحث</span> الليلة؟
        </h1>
      </header>

      <div className="relative mb-8 max-w-2xl">
        <Search size={20} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gold-500" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب اسم فيلم، مخرج، ممثل، أو نوعًا…"
          autoFocus
          className="w-full rounded-2xl border border-cream/15 bg-night-900/80 py-4 pr-14 pl-5 text-base text-cream outline-none transition-all placeholder:text-dust/60 focus:border-gold-500/70 focus:shadow-[0_0_40px_-10px_rgba(242,179,61,0.35)]"
        />
        {query.isFetching && searching && (
          <span className="absolute left-5 top-1/2 h-3 w-3 -translate-y-1/2 animate-blink rounded-full bg-gold-500" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-cream/10 bg-night-900/40 px-6 py-12 text-center"
          >
            <p className="font-display text-lg font-bold text-cream/85">
              ابدأ الكتابة… أو جرّب أحد هذه الأبواب:
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-cream/15 bg-night-850 px-4 py-2 text-sm text-cream/80 transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-300 active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        ) : query.isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GridSkeleton count={12} />
          </motion.div>
        ) : query.isError ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState message="تعذّر البحث" onRetry={() => query.refetch()} />
          </motion.div>
        ) : query.data && query.data.results.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-night-900/40 px-6 py-16 text-center"
          >
            <SearchX size={38} className="text-dust" />
            <p className="font-display text-xl font-bold text-cream">
              لا نتائج عن «{q}»
            </p>
            <p className="max-w-md text-sm leading-7 text-dust">
              جرّب كلمة أقصر أو اسم النوع بدلًا من العنوان — أو فعّل البث الحي من
              الإعدادات للبحث في مكتبة TMDB الكاملة.
            </p>
          </motion.div>
        ) : query.data ? (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="mb-5 text-sm text-dust">
              <span className="font-display text-base font-bold text-gold-300">
                {fmtInt(query.data.totalResults)}
              </span>{" "}
              نتيجة عن «{q}»
            </p>
            <MovieGrid movies={query.data.results} idPrefix={`s${page}`} />
            {query.data.totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => go({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/75 transition-all hover:border-gold-500 hover:text-gold-300 active:scale-90 disabled:opacity-30"
                  aria-label="السابق"
                >
                  <ChevronRight size={18} />
                </button>
                <span className="px-2 font-display text-sm text-dust">
                  صفحة {fmtInt(page)} من {fmtInt(query.data.totalPages)}
                </span>
                <button
                  onClick={() => go({ page: String(page + 1) })}
                  disabled={page >= query.data.totalPages}
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/75 transition-all hover:border-gold-500 hover:text-gold-300 active:scale-90 disabled:opacity-30"
                  aria-label="التالي"
                >
                  <ChevronLeft size={18} />
                </button>
              </nav>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Clapperboard, Clock3, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { MovieDetails } from "../types";
import { posterUrl } from "../lib/tmdb";
import { fmtRuntime, yearOf } from "../lib/format";
import { useFeatured } from "../hooks/queries";
import { useFavoritesStore } from "../store/favorites";
import { useUiStore } from "../store/ui";
import RatingRing from "./RatingRing";
import { HeroSkeleton } from "./Skeletons";

const GLYPHS = "أبجدحخسشصطعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩؟";

function useScramble(text: string): string {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = Math.max(12, text.length * 2.2);
    const iv = setInterval(() => {
      frame += 1;
      const reveal = Math.floor((frame / total) * text.length);
      if (frame >= total) {
        clearInterval(iv);
        setOut(text);
        return;
      }
      setOut(
        text
          .split("")
          .map((ch, i) =>
            ch === " " || i < reveal
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
    }, 32);
    return () => clearInterval(iv);
  }, [text]);
  return out;
}

export default function HeroSpotlight() {
  const { data: featured, isLoading } = useFeatured();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [runId, setRunId] = useState(0);
  const { toggleWatchlist, inWatchlist, toggleFavorite, isFavorite } =
    useFavoritesStore();
  const showToast = useUiStore((s) => s.showToast);

  const movies: MovieDetails[] = useMemo(() => featured ?? [], [featured]);
  const movie = movies[index];

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!movies.length || hover || reduced) return;
    // استئناف بعد التحويم: أعد مزامنة الشريط مع العدّاد
    setRunId((r) => r + 1);
    const iv = setInterval(
      () => setIndex((i) => (i + 1) % movies.length),
      7000
    );
    return () => clearInterval(iv);
  }, [movies.length, hover, reduced, index]);

  const title = useScramble(movie?.title ?? "");

  if (isLoading) return <HeroSkeleton />;
  if (!movie) return null;

  const bgUrl = posterUrl(movie.poster, "w1280");
  const saved = inWatchlist(movie.id);
  const fav = isFavorite(movie.id);
  const arIndex = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦", "٠٧", "٠٨"][index] ?? "٠١";

  return (
    <section
      className="group/hero relative flex min-h-[76vh] flex-col overflow-hidden pt-[108px] lg:pt-[72px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* الخلفية المتحركة */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {bgUrl && (
              <img
                src={bgUrl}
                alt=""
                className="h-full w-full scale-110 object-cover object-center opacity-30 blur-xl"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_70%_35%,rgba(242,179,61,0.13),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_20%_80%,rgba(228,87,46,0.12),transparent_60%)]" />
        <div className="pointer-events-none absolute -inset-x-1/4 top-[-20%] h-[140%] w-1/2 animate-sweep bg-gradient-to-l from-transparent via-cream/[0.05] to-transparent blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/70 via-night-950/20 to-night-950" />
      </div>

      {/* شريط الليتر-بوكس العلوي */}
      <div className="relative z-10 flex h-9 items-center justify-between border-b border-cream/10 bg-night-950/90 px-4 md:h-11 md:px-8">
        <p className="flex items-center gap-2 font-display text-[10px] font-semibold tracking-[0.35em] text-gold-400 md:text-xs" dir="ltr">
          CINEVERSE <span className="text-cream/40">✦</span> NOW SHOWING
        </p>
        <p className="flex items-center gap-2 text-[10px] text-dust md:text-xs">
          <span className="h-1.5 w-1.5 shrink-0 animate-blink rounded-full bg-ember-500" />
          <span className="sm:hidden">الآن يُعرض</span>
          <span className="hidden sm:inline">يُعرض الآن في السينيفرس</span>
        </p>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center gap-8 px-5 py-10 md:gap-14 md:px-8">
        <div className="flex-1 pb-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-gold-400 md:text-sm">
            <Clapperboard size={16} />
            اختيار الأسبوع — {movie.genres[0]?.name ?? "سينما"}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-4xl font-extrabold leading-[1.12] text-cream sm:text-5xl md:text-6xl xl:text-7xl">
                {title}
              </h1>
              {movie.tagline && (
                <p className="mt-3 max-w-xl border-r-2 border-gold-500/70 pr-3 text-sm text-dust md:text-base">
                  «{movie.tagline}»
                </p>
              )}
              <p className="mt-4 max-w-xl text-sm leading-7 text-cream/75 md:text-[15px] line-clamp-3">
                {movie.overview}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-dust">
                <RatingRing value={movie.rating} size={48} />
                <span className="font-display text-lg font-semibold text-cream" dir="ltr">
                  {yearOf(movie.releaseDate)}
                </span>
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} className="text-gold-500" />
                    {fmtRuntime(movie.runtime)}
                  </span>
                )}
                <span className="hidden items-center gap-2 sm:flex">
                  {movie.genres.slice(0, 3).map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-cream/15 px-3 py-0.5 text-xs text-cream/75"
                    >
                      {g.name}
                    </span>
                  ))}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to={`/movie/${movie.id}`}
                  className="group/btn relative overflow-hidden rounded-full bg-gold-500 px-7 py-3 font-display text-sm font-bold text-night-950 shadow-[0_8px_30px_-8px_rgba(242,179,61,0.6)] transition-all hover:bg-gold-400 hover:shadow-[0_10px_38px_-6px_rgba(242,179,61,0.75)] active:scale-95"
                >
                  التفاصيل الكاملة
                </Link>
                <button
                  onClick={() => {
                    toggleWatchlist(movie);
                    showToast(saved ? "أُزيل من قائمة المشاهدة" : "أُضيف إلى قائمة المشاهدة");
                  }}
                  className={`flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold transition-all active:scale-95 ${
                    saved
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-cream/25 text-cream hover:border-gold-500 hover:text-gold-300"
                  }`}
                >
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  {saved ? "في قائمتي" : "قائمتي"}
                </button>
                <button
                  onClick={() => {
                    toggleFavorite(movie);
                    showToast(fav ? "أُزيل من المفضلة" : "أُضيف إلى المفضلة ♥");
                  }}
                  aria-label="مفضلة"
                  className={`grid h-11 w-11 place-items-center rounded-full border transition-all active:scale-90 ${
                    fav
                      ? "border-ember-400/70 bg-ember-500/20 text-ember-300"
                      : "border-cream/25 text-cream hover:border-ember-400 hover:text-ember-300"
                  }`}
                >
                  <Heart size={18} className={fav ? "fill-current" : ""} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* البوستر العائم */}
        <div className="relative hidden shrink-0 md:block">
          <div className="absolute -inset-6 rounded-[2rem] bg-gold-500/10 blur-2xl" />
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 40, rotate: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative h-[50vh] w-[33vh] animate-floaty overflow-hidden rounded-xl border-2 border-cream/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                {bgUrl ? (
                  <img
                    src={bgUrl}
                    alt={`بوستر ${movie.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-night-800" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night-950/90 to-transparent" />
                <p className="absolute bottom-3 right-4 left-4 font-display text-lg font-bold text-cream">
                  {movie.title}
                </p>
                <div className="absolute top-3 left-3">
                  <RatingRing value={movie.rating} size={42} />
                </div>
              </div>
              {/* ثقب البكرة */}
              <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-cream/30 bg-night-950 shadow-inner" />
            </motion.div>
          </AnimatePresence>
          <p className="text-outline mt-6 text-center font-display text-7xl font-extrabold">
            {arIndex}
          </p>
        </div>
      </div>

      {/* شريط الليتر-بوكس السفلي مع التقدّم */}
      <div className="relative z-10 flex h-10 items-center justify-between border-t border-cream/10 bg-night-950/90 px-4 md:h-12 md:px-8">
        <div className="flex items-center gap-2">
          {movies.map((mv, i) => (
            <button
              key={mv.id}
              onClick={() => setIndex(i)}
              aria-label={`الانتقال إلى ${mv.title}`}
              className={`relative h-1 overflow-hidden rounded-full transition-all ${
                i === index ? "w-12 bg-cream/20" : "w-5 bg-cream/15 hover:bg-cream/30"
              }`}
            >
              {i === index && (
                <span
                  key={`bar-${index}-${runId}`}
                  className="progress-grow absolute inset-y-0 right-0 rounded-full bg-gold-500"
                  style={reduced ? { width: "100%", animation: "none" } : undefined}
                />
              )}
            </button>
          ))}
        </div>
        <p className="font-display text-xs text-dust">
          <span className="text-gold-400">{arIndex}</span>
          <span className="mx-1.5">/</span>
          {["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦", "٠٧", "٠٨"][movies.length - 1] ?? "٠٥"}
          <span className="ms-3 hidden text-cream/50 sm:inline">{movie.originalTitle}</span>
        </p>
      </div>
    </section>
  );
}

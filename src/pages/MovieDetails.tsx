import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clapperboard,
  Globe2,
  Heart,
  PlayCircle,
  User,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMovie } from "../hooks/queries";
import { posterUrl } from "../lib/tmdb";
import { fmtDate, fmtInt, fmtMoney, fmtRuntime } from "../lib/format";
import { useFavoritesStore } from "../store/favorites";
import { useSettingsStore } from "../store/settings";
import { useUiStore } from "../store/ui";
import RatingRing from "../components/RatingRing";
import MovieRow from "../components/MovieRow";
import PosterArt from "../components/PosterArt";
import { DetailsSkeleton } from "../components/Skeletons";
import { ErrorState } from "../components/Feedback";

export default function MovieDetails() {
  const { id } = useParams();
  const numId = Number(id);
  const { data, isLoading, isError, refetch, error } = useMovie(numId);
  const { liveMode, apiKey } = useSettingsStore();
  const live = liveMode && apiKey.length > 0;
  const { toggleFavorite, toggleWatchlist, isFavorite, inWatchlist } =
    useFavoritesStore();
  const showToast = useUiStore((s) => s.showToast);

  if (isLoading) return <DetailsSkeleton />;

  const notFound =
    isError && (error as Error)?.message === "not-found";

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-32">
        {notFound ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-night-900/50 px-6 py-16 text-center">
            <Clapperboard size={40} className="text-gold-500" />
            <p className="font-display text-2xl font-bold text-cream">
              هذا الفيلم غير موجود في قاعتنا
            </p>
            <p className="text-sm text-dust">ربما تغيّر رابطه أو أنه لم يُفهرس بعد.</p>
            <Link
              to="/"
              className="mt-2 rounded-full bg-gold-500 px-6 py-2.5 font-display text-sm font-bold text-night-950 transition-all hover:bg-gold-400 active:scale-95"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <ErrorState message="تعذّر جلب تفاصيل الفيلم" onRetry={() => refetch()} />
        )}
      </div>
    );
  }

  if (!data) return null;
  const { details: d, similar } = data;
  const bg = posterUrl(d.backdrop ?? d.poster, "w1280");
  const poster = posterUrl(d.poster, "w500");
  const fav = isFavorite(d.id);
  const saved = inWatchlist(d.id);
  const trailer =
    d.videos.find((v) => v.type === "Trailer") ?? d.videos[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* الغلاف */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          {bg && (
            <img src={bg} alt="" className="h-full w-full scale-110 object-cover object-top opacity-25 blur-lg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/60 via-night-950/70 to-night-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_75%_20%,rgba(242,179,61,0.1),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-24 md:px-8 md:pt-28">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-dust transition-colors hover:text-gold-300"
          >
            <ArrowRight size={16} />
            عودة إلى البهو الرئيسي
          </Link>

          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            {/* البوستر */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-56 shrink-0 md:mx-0 md:sticky md:top-28 md:self-start md:w-72"
            >
              <div className="relative overflow-hidden rounded-xl border-2 border-cream/12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]">
                <div className="aspect-[2/3]">
                  {poster ? (
                    <img src={poster} alt={`بوستر ${d.title}`} className="h-full w-full object-cover" />
                  ) : (
                    <PosterArt title={d.title} seed={d.id} />
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <RatingRing value={d.rating} size={72} strokeWidth={5} />
              </div>
              <p className="mt-2 text-center text-xs text-dust">
                {fmtInt(d.votes)} صوتًا على TMDB
              </p>
            </motion.div>

            {/* المعلومات */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="flex-1"
            >
              <div className="flex flex-wrap gap-2">
                {d.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/discover?genres=${g.id}`}
                    className="rounded-full border border-gold-500/40 bg-gold-500/8 px-3.5 py-1 text-xs font-semibold text-gold-300 transition-all hover:bg-gold-500/20"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-cream md:text-6xl">
                {d.title}
              </h1>
              <p className="mt-2 font-display text-sm text-dust" dir="ltr">
                {d.originalTitle}
              </p>

              {d.tagline && (
                <p className="mt-5 max-w-2xl border-r-2 border-gold-500/70 pr-4 text-base italic leading-8 text-cream/80">
                  «{d.tagline}»
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-dust">
                <span className="font-semibold text-cream/85">{fmtDate(d.releaseDate)}</span>
                {d.runtime > 0 && <span>{fmtRuntime(d.runtime)}</span>}
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Globe2 size={14} className="text-gold-500" />
                  {d.originalLanguage.toUpperCase()}
                </span>
                {d.director && (
                  <span>
                    إخراج: <span className="font-semibold text-gold-300">{d.director}</span>
                  </span>
                )}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {trailer && live && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2.5 rounded-full bg-ember-500 px-7 py-3 font-display text-sm font-bold text-cream shadow-[0_10px_34px_-8px_rgba(228,87,46,0.65)] transition-all hover:bg-ember-400 active:scale-95"
                  >
                    <PlayCircle size={19} className="transition-transform group-hover:scale-110" />
                    شاهد الإعلان
                  </a>
                )}
                <motion.button
                  whileTap={{ scale: 1.12 }}
                  onClick={() => {
                    toggleFavorite(d);
                    showToast(fav ? "أُزيل من المفضلة" : "أُضيف إلى المفضلة ♥");
                  }}
                  className={`flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold transition-all active:scale-95 ${
                    fav
                      ? "border-ember-400/70 bg-ember-500/20 text-ember-300"
                      : "border-cream/25 text-cream hover:border-ember-400 hover:text-ember-300"
                  }`}
                >
                  <Heart size={17} className={fav ? "fill-current" : ""} />
                  {fav ? "في المفضلة" : "أضف للمفضلة"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 1.12 }}
                  onClick={() => {
                    toggleWatchlist(d);
                    showToast(saved ? "أُزيل من قائمة المشاهدة" : "أُضيف إلى قائمة المشاهدة");
                  }}
                  className={`flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold transition-all active:scale-95 ${
                    saved
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-cream/25 text-cream hover:border-gold-500 hover:text-gold-300"
                  }`}
                >
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  {saved ? "في قائمتي" : "شاهد لاحقًا"}
                </motion.button>
              </div>

              <section className="mt-9">
                <h2 className="font-display text-xl font-bold text-gold-400">القصة</h2>
                <p className="mt-3 max-w-3xl text-[15px] leading-8 text-cream/80">
                  {d.overview || "لم تُنشر قصة هذا الفيلم بعد — عد قريبًا."}
                </p>
              </section>

              {/* أرقام الفيلم */}
              <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <Wallet size={17} />, label: "الميزانية", value: fmtMoney(d.budget) },
                  { icon: <TrendingUp size={17} />, label: "الإيرادات", value: fmtMoney(d.revenue) },
                  { icon: <User size={17} />, label: "المخرج", value: d.director || "—" },
                  { icon: <Clapperboard size={17} />, label: "الشعبية", value: fmtInt(Math.round(d.popularity)) },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="rounded-lg border border-cream/10 bg-night-850/80 p-4 transition-colors hover:border-gold-500/40"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] text-dust">
                      <span className="text-gold-500">{s.icon}</span>
                      {s.label}
                    </span>
                    <p className="mt-1.5 truncate font-display text-sm font-bold text-cream" title={String(s.value)}>
                      {s.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* طاقم التمثيل */}
      {d.cast.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-ember-500" />
            <h2 className="font-display text-2xl font-bold text-cream md:text-3xl">أمام الكاميرا</h2>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-6 overflow-x-auto px-1 pb-3">
            {d.cast.map((c, i) => {
              const profile = posterUrl(c.profile, "w185");
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="group w-28 shrink-0 text-center"
                >
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-cream/12 transition-all duration-300 group-hover:border-gold-500/70 group-hover:shadow-[0_0_28px_-6px_rgba(242,179,61,0.5)]">
                    {profile ? (
                      <img src={profile} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-night-700 to-night-850">
                        <span className="font-display text-2xl font-bold text-gold-400">
                          {c.name.replace(/^«|»$/g, "").trim().charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-cream/85 leading-snug line-clamp-2">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-dust line-clamp-1">{c.character}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* أعمال مشابهة */}
      {similar.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 pb-6 md:px-8">
          <MovieRow
            title="من القاعة نفسها"
            subtitle="أعمال تشبه هذا الفيلم في الروح والنوع"
            accent="mint"
            movies={similar}
            idPrefix="sim"
          />
        </div>
      )}
    </motion.div>
  );
}

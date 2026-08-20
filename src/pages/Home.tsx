import { motion } from "framer-motion";
import { KeyRound, Popcorn, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSpotlight from "../components/HeroSpotlight";
import TickerMarquee from "../components/TickerMarquee";
import MovieRow from "../components/MovieRow";
import { ErrorState } from "../components/Feedback";
import { RowSkeleton } from "../components/Skeletons";
import { useTrending, useTopRated, useNowPlaying, useUpcoming } from "../hooks/queries";
import { useSettingsStore } from "../store/settings";
import { useUiStore } from "../store/ui";
import { allGenres } from "../lib/tmdb";
import { DEMO_MOVIES } from "../lib/demo";

const MOSAIC_COLORS = [
  { border: "hover:border-gold-500/70", text: "group-hover:text-gold-300", bg: "bg-gold-500/8" },
  { border: "hover:border-ember-500/70", text: "group-hover:text-ember-300", bg: "bg-ember-500/8" },
  { border: "hover:border-mint-400/70", text: "group-hover:text-mint-300", bg: "bg-mint-400/8" },
];

const MOSAIC_SPANS = [
  "md:col-span-2", "", "md:col-span-2", "", "md:col-span-2", "",
  "md:col-span-2", "", "md:col-span-2", "", "md:col-span-2", "",
];

export default function Home() {
  const trending = useTrending();
  const topRated = useTopRated();
  const nowPlaying = useNowPlaying();
  const upcoming = useUpcoming();
  const { liveMode, apiKey } = useSettingsStore();
  const live = liveMode && apiKey.length > 0;
  const openSettings = useUiStore((s) => s.openSettings);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <HeroSpotlight />
      <TickerMarquee movies={trending.data ?? []} live={live} />

      <div className="mx-auto max-w-7xl space-y-16 px-5 pt-14 md:px-8 md:pt-20">
        {/* الرائج */}
        {trending.isLoading ? (
          <RowSkeleton />
        ) : trending.isError ? (
          <ErrorState message="تعذّر جلب الرائج" onRetry={() => trending.refetch()} />
        ) : (
          <MovieRow
            title="رائج هذا الأسبوع"
            subtitle="ما يشاهده جمهور السينيفرس الآن — مرتّبًا لحظيًا"
            accent="gold"
            movies={trending.data ?? []}
            viewAllTo="/discover?sort=popularity.desc"
            idPrefix="tr"
          />
        )}

        {/* الأعلى تقييمًا */}
        {topRated.isLoading ? (
          <RowSkeleton />
        ) : topRated.isError ? (
          <ErrorState message="تعذّر جلب الأعلى تقييمًا" onRetry={() => topRated.refetch()} />
        ) : (
          <MovieRow
            title="قاعة الأعلى تقييمًا"
            subtitle="الأعمال التي حفرت اسمها في ذاكرة النقاد والجمهور"
            accent="ember"
            movies={topRated.data ?? []}
            viewAllTo="/discover?sort=vote_average.desc"
            idPrefix="top"
          />
        )}

        {/* شريط تفعيل البث الحي */}
        {!live && (
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl border border-mint-400/25 bg-gradient-to-l from-mint-400/10 via-night-850 to-night-850 px-6 py-7 md:px-10"
          >
            <div className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-mint-400/15 blur-3xl" />
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-xl font-bold text-cream md:text-2xl">
                  <Popcorn className="text-mint-300" size={22} />
                  أنت تشاهد الآن «وضع العرض» — جرّب البث الحي
                </p>
                <p className="mt-1.5 max-w-xl text-sm leading-7 text-dust">
                  أدخل مفتاح TMDB المجاني (٣٢ خانة) وافتح الكون كاملًا: آلاف
                  الأفلام الحقيقية، ترندات عالمية لحظية، مقاطع دعائية وطاقم تمثيل
                  كامل — وكل شيء آخر كما هو.
                </p>
              </div>
              <button
                onClick={openSettings}
                className="flex shrink-0 items-center gap-2.5 rounded-full bg-mint-400 px-7 py-3.5 font-display text-sm font-bold text-night-950 shadow-[0_10px_36px_-8px_rgba(78,217,198,0.55)] transition-all hover:bg-mint-300 active:scale-95"
              >
                <KeyRound size={17} />
                تفعيل البث الحي
              </button>
            </div>
          </motion.aside>
        )}

        {/* فسيفساء الأنواع */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-mint-400" />
            <h2 className="font-display text-2xl font-bold text-cream md:text-3xl">
              ادخل من باب نوعك المفضل
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {allGenres.slice(0, 12).map((g, i) => {
              const c = MOSAIC_COLORS[i % 3];
              const count = DEMO_MOVIES.filter((mv) => mv.genreIds.includes(g.id)).length;
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: (i % 6) * 0.06 }}
                  className={MOSAIC_SPANS[i] || ""}
                >
                  <Link
                    to={`/discover?genres=${g.id}`}
                    className={`group relative flex h-full min-h-[92px] items-end justify-between overflow-hidden rounded-lg border border-cream/10 bg-night-850 p-4 transition-all duration-300 hover:-translate-y-1 ${c.border}`}
                  >
                    <span className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${c.bg}`} />
                    <span className="text-outline-gold absolute -top-3 left-2 font-display text-5xl font-extrabold opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative">
                      <span className={`block font-display text-lg font-bold text-cream transition-colors ${c.text}`}>
                        {g.name}
                      </span>
                      <span className="text-[11px] text-dust">
                        {live ? "افتح القاعة" : `${count} فيلم في العرض`}
                      </span>
                    </span>
                    <Ticket
                      size={20}
                      className="relative rotate-12 text-cream/25 transition-all duration-300 group-hover:rotate-0 group-hover:text-gold-400"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* في الصالات الآن */}
        {nowPlaying.isLoading ? (
          <RowSkeleton />
        ) : nowPlaying.isError ? (
          <ErrorState message="تعذّر جلب أفلام الصالات" onRetry={() => nowPlaying.refetch()} />
        ) : (
          <MovieRow
            title="في الصالات الآن"
            subtitle="الإصدارات التي تضيء شاشات العرض هذه الأيام"
            accent="mint"
            movies={nowPlaying.data ?? []}
            viewAllTo="/discover?sort=primary_release_date.desc"
            idPrefix="np"
          />
        )}

        {/* قادم قريبًا */}
        {upcoming.isLoading ? (
          <RowSkeleton />
        ) : upcoming.isError ? (
          <ErrorState message="تعذّر جلب القادم" onRetry={() => upcoming.refetch()} />
        ) : (
          <MovieRow
            title="على بُعد مقطورة"
            subtitle="مواعيد مرتقبة يستحق تقويمك أن يحجز لها"
            accent="gold"
            movies={upcoming.data ?? []}
            idPrefix="up"
          />
        )}
      </div>
    </motion.div>
  );
}

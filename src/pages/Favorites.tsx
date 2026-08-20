import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, Popcorn, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MovieGrid } from "../components/MovieCard";
import { useFavoritesStore } from "../store/favorites";
import { useUiStore } from "../store/ui";
import { fmtInt } from "../lib/format";

type Tab = "favorites" | "watchlist";

/** رسم بكرة فيلم فارغة — حالة «لا شيء هنا بعد» */
function EmptyReel() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="46" stroke="#F2B33D" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="6 8" />
      <circle cx="60" cy="60" r="9" fill="#F2B33D" fillOpacity="0.7" />
      <circle cx="60" cy="32" r="8" stroke="#A79DB8" strokeOpacity="0.5" strokeWidth="2.5" />
      <circle cx="60" cy="88" r="8" stroke="#A79DB8" strokeOpacity="0.5" strokeWidth="2.5" />
      <circle cx="32" cy="60" r="8" stroke="#A79DB8" strokeOpacity="0.5" strokeWidth="2.5" />
      <circle cx="88" cy="60" r="8" stroke="#A79DB8" strokeOpacity="0.5" strokeWidth="2.5" />
      <path d="M20 100l-8 10M100 100l8 10" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Favorites() {
  const { favorites, watchlist, clearFavorites, clearWatchlist } =
    useFavoritesStore();
  const showToast = useUiStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("favorites");
  const [confirmClear, setConfirmClear] = useState(false);
  const items = tab === "favorites" ? favorites : watchlist;

  // إعادة ضبط تأكيد المسح عند تبديل التبويب أو انقضاء المهلة
  useEffect(() => {
    setConfirmClear(false);
  }, [tab]);
  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3200);
    return () => clearTimeout(t);
  }, [confirmClear]);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    if (tab === "favorites") {
      clearFavorites();
      showToast("مُسحت المفضلة بالكامل");
    } else {
      clearWatchlist();
      showToast("مُسحت قائمة المشاهدة بالكامل");
    }
    setConfirmClear(false);
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
        <p className="text-sm font-semibold text-ember-400">أرشيفك الشخصي</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold text-cream md:text-5xl">
          مكتبتي <span className="text-outline-gold">السينمائية</span>
        </h1>
        <p className="mt-2 text-sm text-dust">
          محفوظة في متصفحك — لا حساب، لا انتظار، فقط أنت وأفلامك.
        </p>
      </header>

      {/* التبويبات */}
      <div className="mb-8 flex items-center gap-2 border-b border-cream/10">
        {(
          [
            { key: "favorites", label: "المفضلة", count: favorites.length, icon: <Heart size={15} className="text-ember-400" /> },
            { key: "watchlist", label: "قائمة المشاهدة", count: watchlist.length, icon: <Bookmark size={15} className="text-gold-500" /> },
          ] as { key: Tab; label: string; count: number; icon: ReactNode }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative -mb-px flex items-center gap-2 border-b-2 px-5 py-3 font-display text-sm font-bold transition-colors ${
              tab === t.key
                ? "border-gold-500 text-gold-300"
                : "border-transparent text-dust hover:text-cream"
            }`}
          >
            {t.icon}
            {t.label}
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${
                tab === t.key ? "bg-gold-500 text-night-950" : "bg-night-700 text-cream/70"
              }`}
            >
              {fmtInt(t.count)}
            </span>
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mb-7 flex items-center justify-between gap-3">
          <p className="text-sm text-dust">
            عدد الأفلام:{" "}
            <span className="font-display font-bold text-gold-300">
              {fmtInt(items.length)}
            </span>
          </p>
          <button
            onClick={handleClear}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 font-display text-xs font-bold transition-all active:scale-95 ${
              confirmClear
                ? "border-ember-500 bg-ember-500 text-cream shadow-[0_6px_22px_-6px_rgba(228,87,46,0.7)]"
                : "border-cream/15 text-dust hover:border-ember-500/60 hover:text-ember-300"
            }`}
          >
            <Trash2 size={14} />
            {confirmClear ? "اضغط مجددًا للتأكيد" : "مسح الكل"}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key={`empty-${tab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-cream/15 bg-night-900/40 px-6 py-20 text-center"
          >
            <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <EmptyReel />
            </motion.div>
            <div>
              <p className="font-display text-2xl font-bold text-cream">
                {tab === "favorites" ? "المفضلة فارغة… بعد" : "قائمتك تنتظر أول فيلم"}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-dust">
                مرّر فوق أي بوستر واضغط القلب{" "}
                {tab === "favorites" ? "الأحمر" : "أو علامة الحفظ الذهبية"} لتبدأ
                أرشيفك. سنحفظه هنا حتى تعود.
              </p>
            </div>
            <Link
              to="/discover"
              className="flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 font-display text-sm font-bold text-night-950 transition-all hover:bg-gold-400 active:scale-95"
            >
              <Popcorn size={17} />
              ابدأ الاستكشاف
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${tab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MovieGrid movies={items} idPrefix={tab} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

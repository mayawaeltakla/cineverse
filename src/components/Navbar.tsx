import { useEffect, useState, type FormEvent } from "react";
import { Heart, Search, Settings2, Sparkles } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store/settings";
import { useFavoritesStore } from "../store/favorites";
import { useUiStore } from "../store/ui";

/** شعار السينيفرس — بكرة فيلم مرسومة يدويًا */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="#F2B33D" strokeWidth="2.6" />
      <circle cx="24" cy="24" r="4" fill="#F2B33D" />
      <circle cx="24" cy="10.5" r="3.4" fill="none" stroke="#F2B33D" strokeWidth="2.2" />
      <circle cx="24" cy="37.5" r="3.4" fill="none" stroke="#F2B33D" strokeWidth="2.2" />
      <circle cx="10.5" cy="24" r="3.4" fill="none" stroke="#F2B33D" strokeWidth="2.2" />
      <circle cx="37.5" cy="24" r="3.4" fill="none" stroke="#F2B33D" strokeWidth="2.2" />
      <path d="M44 8l2.5 4.5M4 40l-2.5-4.5" stroke="#E4572E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-full px-4 py-1.5 font-display text-sm font-semibold transition-colors ${
    isActive
      ? "bg-gold-500/15 text-gold-300"
      : "text-cream/75 hover:text-gold-300"
  }`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { liveMode, apiKey } = useSettingsStore();
  const live = liveMode && apiKey.length > 0;
  const favCount = useFavoritesStore((s) => s.favorites.length);
  const watchCount = useFavoritesStore((s) => s.watchlist.length);
  const openSettings = useUiStore((s) => s.openSettings);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-cream/10 bg-night-950/85 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          : "bg-gradient-to-b from-night-950/90 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[72px] md:px-8">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="الصفحة الرئيسية">
          <span className="transition-transform duration-500 group-hover:rotate-90">
            <Logo />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-extrabold text-cream transition-colors group-hover:text-gold-300">
              سينيفرس
            </span>
            <span className="block font-display text-[9px] font-semibold tracking-[0.42em] text-gold-500/90" dir="ltr">
              CINEVERSE
            </span>
          </span>
        </Link>

        <nav className="ms-4 hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          <NavLink to="/" end className={linkCls}>
            الرئيسية
          </NavLink>
          <NavLink to="/discover" className={linkCls}>
            استكشاف
          </NavLink>
          <NavLink to="/favorites" className={linkCls}>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className={favCount ? "fill-ember-400 text-ember-400" : ""} />
              مكتبتي
              {favCount + watchCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember-500 px-1 font-display text-[10px] font-bold text-cream">
                  {favCount + watchCount}
                </span>
              )}
            </span>
          </NavLink>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:gap-3">
          <form onSubmit={submit} className="relative" role="search">
            <Search
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فيلم، مخرج، ممثل…"
              className="w-36 rounded-full border border-cream/15 bg-night-900/80 py-2 pr-9 pl-4 text-sm text-cream placeholder:text-dust/70 outline-none transition-all duration-300 focus:w-52 focus:border-gold-500/70 focus:bg-night-900 sm:w-44 sm:focus:w-72"
            />
          </form>

          <button
            onClick={openSettings}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all hover:border-gold-500/70 active:scale-95 ${
              live
                ? "border-mint-400/40 bg-mint-400/10 text-mint-300"
                : "border-cream/15 bg-night-900/60 text-dust hover:text-gold-300"
            }`}
            aria-label="إعدادات الاتصال"
          >
            <span className={`h-2 w-2 rounded-full ${live ? "animate-blink bg-mint-400" : "bg-gold-500"}`} />
            <span className="hidden lg:inline">{live ? "بث حي · TMDB" : "وضع تجريبي"}</span>
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* روابط الجوال */}
      <nav className="flex items-center gap-1 border-t border-cream/5 px-4 py-2 md:hidden" aria-label="تنقل الجوال">
        <NavLink to="/" end className={linkCls}>
          الرئيسية
        </NavLink>
        <NavLink to="/discover" className={linkCls}>
          استكشاف
        </NavLink>
        <NavLink to="/favorites" className={linkCls}>
          مكتبتي ({favCount + watchCount})
        </NavLink>
        <span className="ms-auto flex items-center gap-1 text-[10px] text-dust">
          <Sparkles size={11} className="text-gold-500" />
          {live ? "بيانات حية" : "بيانات تجريبية"}
        </span>
      </nav>
    </header>
  );
}

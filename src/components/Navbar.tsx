import { useEffect, useState, type FormEvent } from "react";
import {
  Clapperboard,
  Compass,
  Heart,
  Library,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 font-display text-sm font-semibold transition-colors ${
    isActive ? "bg-gold-500/15 text-gold-300" : "text-cream/75 hover:text-gold-300"
  }`;

const mobileTab = ({ isActive }: { isActive: boolean }) =>
  `relative flex h-full flex-col items-center justify-center gap-0.5 font-display text-[11px] font-bold transition-colors ${
    isActive ? "text-gold-300" : "text-cream/60 active:text-cream"
  }`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { liveMode, apiKey } = useSettingsStore();
  const live = liveMode && apiKey.length > 0;
  const favCount = useFavoritesStore((s) => s.favorites.length);
  const watchCount = useFavoritesStore((s) => s.watchlist.length);
  const openSettings = useUiStore((s) => s.openSettings);
  const libraryCount = favCount + watchCount;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // إغلاق البحث عند تغيّر الصفحة
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setQ("");
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || searchOpen
          ? "border-b border-cream/10 bg-night-950/92 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          : "bg-gradient-to-b from-night-950/90 via-night-950/55 to-transparent"
      }`}
    >
      {/* الصف العلوي */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:h-[72px] md:gap-3 md:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label="الصفحة الرئيسية">
          <span className="shrink-0 transition-transform duration-500 group-hover:rotate-90">
            <Logo size={36} />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-lg font-extrabold text-cream transition-colors group-hover:text-gold-300 sm:text-xl">
              سينيفرس
            </span>
            <span className="hidden font-display text-[9px] font-semibold tracking-[0.42em] text-gold-500/90 sm:block" dir="ltr">
              CINEVERSE
            </span>
          </span>
        </Link>

        {/* روابط سطح المكتب */}
        <nav className="ms-3 hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          <NavLink to="/" end className={desktopLink}>
            الرئيسية
          </NavLink>
          <NavLink to="/discover" className={desktopLink}>
            استكشاف
          </NavLink>
          <NavLink to="/favorites" className={desktopLink}>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className={favCount ? "fill-ember-400 text-ember-400" : ""} />
              مكتبتي
              {libraryCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember-500 px-1 font-display text-[10px] font-bold text-cream">
                  {libraryCount}
                </span>
              )}
            </span>
          </NavLink>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          {/* بحث مضمّن — شاشات متوسطة فأكبر */}
          <form onSubmit={submit} className="relative hidden sm:block" role="search">
            <Search
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فيلم…"
              aria-label="البحث عن الأفلام"
              className="w-36 rounded-full border border-cream/15 bg-night-900/80 py-2 pr-9 pl-4 text-sm text-cream placeholder:text-dust/70 outline-none transition-all duration-300 focus:w-56 focus:border-gold-500/70 focus:bg-night-900 md:w-44 md:focus:w-72"
            />
          </form>

          {/* زر فتح البحث — الهواتف */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"}
            aria-expanded={searchOpen}
            className={`grid h-10 w-10 place-items-center rounded-full border transition-all active:scale-90 sm:hidden ${
              searchOpen
                ? "border-gold-500 bg-gold-500/15 text-gold-300"
                : "border-cream/15 bg-night-900/70 text-cream/85"
            }`}
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>

          {/* الإعدادات ووضع الاتصال */}
          <button
            onClick={openSettings}
            className={`flex items-center gap-2 rounded-full border py-2 pl-3 pr-2.5 text-xs font-semibold transition-all hover:border-gold-500/70 active:scale-95 md:px-3.5 ${
              live
                ? "border-mint-400/40 bg-mint-400/10 text-mint-300"
                : "border-cream/15 bg-night-900/70 text-dust hover:text-gold-300"
            }`}
            aria-label="إعدادات الاتصال"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${live ? "animate-blink bg-mint-400" : "bg-gold-500"}`} />
            <span className="hidden xl:inline">{live ? "بث حي · TMDB" : "وضع تجريبي"}</span>
            <Settings2 size={15} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* شريط البحث المنسدل — الهواتف */}
      {searchOpen && (
        <form
          onSubmit={submit}
          role="search"
          className="border-t border-cream/5 px-4 py-2.5 shadow-[0_18px_35px_-18px_rgba(0,0,0,0.9)] sm:hidden"
        >
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust"
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فيلم، مخرج، ممثل…"
              aria-label="البحث عن الأفلام"
              className="w-full rounded-full border border-cream/15 bg-night-900 py-2.5 pr-10 pl-10 text-sm text-cream placeholder:text-dust/70 outline-none focus:border-gold-500/70"
            />
            <button
              type="submit"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gold-500 px-3.5 py-1.5 font-display text-xs font-bold text-night-950 active:scale-95"
            >
              بحث
            </button>
          </div>
        </form>
      )}

      {/* تبويبات الجوال */}
      <nav
        className="grid h-11 grid-cols-3 border-t border-cream/8 bg-night-950/60 lg:hidden"
        aria-label="تنقل الجوال"
      >
        <NavLink to="/" end className={mobileTab}>
          {({ isActive }) => (
            <>
              <Clapperboard size={17} className={isActive ? "text-gold-300" : ""} />
              الرئيسية
              {isActive && (
                <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-gold-500" />
              )}
            </>
          )}
        </NavLink>
        <NavLink to="/discover" className={mobileTab}>
          {({ isActive }) => (
            <>
              <Compass size={17} className={isActive ? "text-gold-300" : ""} />
              استكشاف
              {isActive && (
                <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-gold-500" />
              )}
            </>
          )}
        </NavLink>
        <NavLink to="/favorites" className={mobileTab}>
          {({ isActive }) => (
            <>
              <span className="relative">
                <Library size={17} className={isActive ? "text-gold-300" : ""} />
                {libraryCount > 0 && (
                  <span className="absolute -left-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ember-500 px-0.5 font-display text-[9px] font-bold leading-none text-cream">
                    {libraryCount}
                  </span>
                )}
              </span>
              مكتبتي
              {isActive && (
                <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-gold-500" />
              )}
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
}

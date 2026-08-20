import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronDown,
  Heart,
  LogOut,
  Moon,
  Search,
  Settings2,
  Sun,
  User,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store/settings";
import { useAuthStore, useCurrentUser } from "../store/auth";
import { useFavoritesStore } from "../store/favorites";
import { useUiStore } from "../store/ui";

/** شعار السينيفرس — بكرة فيلم مرسومة يدويًا */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="var(--color-gold-500)" strokeWidth="2.6" />
      <circle cx="24" cy="24" r="4" fill="var(--color-gold-500)" />
      <circle cx="24" cy="10.5" r="3.4" fill="none" stroke="var(--color-gold-500)" strokeWidth="2.2" />
      <circle cx="24" cy="37.5" r="3.4" fill="none" stroke="var(--color-gold-500)" strokeWidth="2.2" />
      <circle cx="10.5" cy="24" r="3.4" fill="none" stroke="var(--color-gold-500)" strokeWidth="2.2" />
      <circle cx="37.5" cy="24" r="3.4" fill="none" stroke="var(--color-gold-500)" strokeWidth="2.2" />
      <path d="M44 8l2.5 4.5M4 40l-2.5-4.5" stroke="var(--color-ember-500)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-sm font-semibold transition-all lg:px-4 ${
    isActive
      ? "bg-gold-500/15 text-gold-300 shadow-[inset_0_-2px_0_var(--color-gold-500)]"
      : "text-cream/75 hover:text-gold-300"
  }`;

function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={dark ? "الوضع النهاري" : "الوضع الليلي"}
      className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-cream/15 bg-night-900/60 text-cream/80 transition-all hover:border-gold-500/70 hover:text-gold-300 active:scale-90"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          initial={{ rotate: -100, opacity: 0, scale: 0.4 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 100, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          {dark ? <Sun size={17} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function AuthChip() {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const showToast = useUiStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold-500/50 bg-gold-500/10 px-3.5 py-2 font-display text-xs font-bold text-gold-300 transition-all hover:bg-gold-500/20 active:scale-95"
      >
        <User size={14} />
        <span className="hidden sm:inline">دخول / حساب</span>
      </Link>
    );
  }

  const initial = user.name.trim().slice(0, 1) || "؟";

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="قائمة المستخدم"
        className={`flex items-center gap-1.5 rounded-full border py-1 pr-1 pl-2 transition-all active:scale-95 ${
          open
            ? "border-gold-500/70 bg-night-800"
            : "border-cream/15 bg-night-900/60 hover:border-gold-500/50"
        }`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-500 font-display text-sm font-extrabold text-night-950">
          {initial}
        </span>
        <span className="hidden max-w-24 truncate text-xs font-bold text-cream/85 md:block">
          {user.name}
        </span>
        <ChevronDown
          size={13}
          className={`text-dust transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              className="fixed inset-0 z-40 cursor-default"
              aria-label="إغلاق القائمة"
              onClick={() => setOpen(false)}
              tabIndex={-1}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute start-0 top-[calc(100%+8px)] z-50 w-56 origin-top overflow-hidden rounded-xl border border-cream/12 bg-night-850 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)]"
            >
              <div className="border-b border-cream/8 bg-night-900/60 px-4 py-3">
                <p className="truncate font-display text-sm font-bold text-cream">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-dust" dir="ltr">
                  {user.email}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-cream/80 transition-colors hover:bg-gold-500/10 hover:text-gold-300"
                >
                  <Bookmark size={15} />
                  مكتبتي
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    showToast("تم تسجيل الخروج — إلى اللقاء في العرض القادم");
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ember-300 transition-colors hover:bg-ember-500/10"
                >
                  <LogOut size={15} />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
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
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileSearch(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-cream/10 bg-night-950/85 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          : "bg-gradient-to-b from-night-950/90 to-transparent"
      }`}
    >
      {/* الصف الأول */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 md:h-[72px] md:gap-3 md:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="الصفحة الرئيسية">
          <span className="transition-transform duration-500 group-hover:rotate-90">
            <Logo />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-extrabold text-cream transition-colors group-hover:text-gold-300">
              سينيفرس
            </span>
            <span className="hidden font-display text-[9px] font-semibold tracking-[0.42em] text-gold-500/90 sm:block" dir="ltr">
              CINEVERSE
            </span>
          </span>
        </Link>

        <nav className="ms-2 hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
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

        <div className="ms-auto flex items-center gap-2">
          {/* بحث سطح المكتب */}
          <form onSubmit={submit} className="relative hidden md:block" role="search">
            <Search size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فيلم…"
              aria-label="ابحث عن فيلم"
              className="w-36 rounded-full border border-cream/15 bg-night-900/80 py-2 pr-9 pl-4 text-sm text-cream placeholder:text-dust/70 outline-none transition-all duration-300 focus:w-52 focus:border-gold-500/70 focus:bg-night-900 lg:w-44 lg:focus:w-72"
            />
          </form>

          {/* زر بحث الجوال */}
          <button
            onClick={() => setMobileSearch((s) => !s)}
            aria-label="فتح البحث"
            aria-expanded={mobileSearch}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all active:scale-90 md:hidden ${
              mobileSearch
                ? "border-gold-500 bg-gold-500/15 text-gold-300"
                : "border-cream/15 bg-night-900/60 text-cream/80"
            }`}
          >
            <Search size={17} />
          </button>

          <ThemeToggle />
          <AuthChip />

          <button
            onClick={openSettings}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all hover:border-gold-500/70 active:scale-95 ${
              live
                ? "border-mint-400/40 bg-mint-400/10 text-mint-300"
                : "border-cream/15 bg-night-900/60 text-dust hover:text-gold-300"
            }`}
            aria-label="إعدادات الاتصال"
            title={live ? "بث حي عبر TMDB" : "وضع تجريبي — أضف مفتاح TMDB"}
          >
            <span className={`h-2 w-2 rounded-full ${live ? "animate-blink bg-mint-400" : "bg-gold-500"}`} />
            <span className="hidden xl:inline">{live ? "بث حي" : "تجريبي"}</span>
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* بحث الجوال القابل للطي */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-cream/5 md:hidden"
          >
            <form onSubmit={submit} className="flex items-center gap-2 px-4 py-2.5" role="search">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ابحث عن فيلم، مخرج، ممثل…"
                  aria-label="ابحث عن فيلم"
                  autoFocus
                  className="w-full rounded-full border border-cream/15 bg-night-900 py-2.5 pr-10 pl-4 text-sm text-cream placeholder:text-dust/70 outline-none focus:border-gold-500/70"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-gold-500 px-4 py-2.5 font-display text-xs font-bold text-night-950 active:scale-95"
              >
                بحث
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تبويبات الجوال */}
      <nav
        className="flex items-center gap-1 border-t border-cream/5 px-3 py-1.5 lg:hidden"
        aria-label="تنقل الجوال"
      >
        <NavLink to="/" end className={linkCls}>
          الرئيسية
        </NavLink>
        <NavLink to="/discover" className={linkCls}>
          استكشاف
        </NavLink>
        <NavLink to="/favorites" className={linkCls}>
          <span className="flex items-center gap-1.5">
            مكتبتي
            {favCount + watchCount > 0 && (
              <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ember-500 px-1 font-display text-[9px] font-bold text-cream">
                {favCount + watchCount}
              </span>
            )}
          </span>
        </NavLink>
      </nav>
    </header>
  );
}

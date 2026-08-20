import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SettingsModal from "./components/SettingsModal";
import { Toast } from "./components/Feedback";
import { useSettingsStore } from "./store/settings";
import { useAuthStore } from "./store/auth";
import { useFavoritesStore } from "./store/favorites";
import { useHistoryStore } from "./store/history";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import SearchPage from "./pages/SearchPage";
import AuthPage from "./pages/AuthPage";
import DatabasePage from "./pages/DatabasePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/** خلفية محيطية: توهجات + بكرة فيلم شبحية تدور ببطء */
function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_-10%,rgba(242,179,61,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_-10%_40%,rgba(228,87,46,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_115%,rgba(78,217,198,0.05),transparent_60%)]" />
      <svg
        className="absolute -left-28 top-24 h-[520px] w-[520px] opacity-[0.045] animate-[spin_120s_linear_infinite]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="46" stroke="#F2B33D" strokeWidth="1" />
        <circle cx="50" cy="50" r="7" stroke="#F2B33D" strokeWidth="1" />
        <circle cx="50" cy="20" r="9" stroke="#F2B33D" strokeWidth="0.8" />
        <circle cx="50" cy="80" r="9" stroke="#F2B33D" strokeWidth="0.8" />
        <circle cx="20" cy="50" r="9" stroke="#F2B33D" strokeWidth="0.8" />
        <circle cx="80" cy="50" r="9" stroke="#F2B33D" strokeWidth="0.8" />
      </svg>
      <svg
        className="absolute -right-24 bottom-10 h-[380px] w-[380px] opacity-[0.035] animate-[spin_150s_linear_infinite_reverse]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="46" stroke="#4ED9C6" strokeWidth="1" />
        <circle cx="50" cy="50" r="7" stroke="#4ED9C6" strokeWidth="1" />
        <circle cx="50" cy="20" r="9" stroke="#4ED9C6" strokeWidth="0.8" />
        <circle cx="50" cy="80" r="9" stroke="#4ED9C6" strokeWidth="0.8" />
        <circle cx="20" cy="50" r="9" stroke="#4ED9C6" strokeWidth="0.8" />
        <circle cx="80" cy="50" r="9" stroke="#4ED9C6" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 650);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة إلى الأعلى"
      className={`fixed bottom-6 left-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-gold-500/50 bg-night-900/90 text-gold-300 shadow-[0_12px_35px_-10px_rgba(242,179,61,0.45)] backdrop-blur-md transition-all duration-300 hover:bg-gold-500 hover:text-night-950 active:scale-90 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}

function ThemeApplier() {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.backgroundColor =
      theme === "light" ? "#f4f1f6" : "#0b0910";
  }, [theme]);
  return null;
}

/** فتح قاعدة البيانات، ترحيل البيانات القديمة، ومزامنة المكتبة مع الجلسة */
function DbBootstrap() {
  const initAuth = useAuthStore((s) => s.init);
  const ready = useAuthStore((s) => s.ready);
  const userId = useAuthStore((s) => s.currentUser?.id);
  const hydrateLibrary = useFavoritesStore((s) => s.hydrate);
  const hydrateHistory = useHistoryStore((s) => s.hydrate);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (ready) {
      void hydrateLibrary();
      void hydrateHistory();
    }
  }, [ready, userId, hydrateLibrary, hydrateHistory]);

  return null;
}

function Shell() {
  const location = useLocation();
  return (
    <div className="film-grain relative min-h-screen">
      <ThemeApplier />
      <DbBootstrap />
      <AmbientBackdrop />
      <Navbar />
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <SettingsModal />
      <Toast />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <HashRouter>
          <Shell />
        </HashRouter>
      </MotionConfig>
    </QueryClientProvider>
  );
}

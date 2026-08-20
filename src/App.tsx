import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SettingsModal from "./components/SettingsModal";
import { Toast } from "./components/Feedback";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import SearchPage from "./pages/SearchPage";

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

function Shell() {
  const location = useLocation();
  return (
    <div className="film-grain relative min-h-screen">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <SettingsModal />
      <Toast />
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

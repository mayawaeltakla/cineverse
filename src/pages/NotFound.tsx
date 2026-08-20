import { motion } from "framer-motion";
import { ArrowRight, Clapperboard, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-16 text-center"
    >
      {/* شريط فيلم مقطوع في الخلفية */}
      <div
        className="pointer-events-none absolute inset-x-[-10%] top-1/3 h-16 -rotate-6 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #F5EDDE 0 34px, transparent 34px 46px)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[-10%] bottom-1/4 h-16 rotate-3 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #F5EDDE 0 34px, transparent 34px 46px)",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ rotate: -8, y: 20, opacity: 0 }}
        animate={{ rotate: 0, y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <Clapperboard size={64} className="text-gold-500" strokeWidth={1.4} />
        <motion.span
          className="absolute -left-2 -top-2 h-3 w-3 rounded-full bg-ember-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <p className="text-outline mt-8 font-display text-[9rem] font-extrabold leading-none sm:text-[12rem]">
        404
      </p>

      <h1 className="mt-2 font-display text-3xl font-extrabold text-cream sm:text-4xl">
        هذا المشهد <span className="text-gold-400">مفقود من المونتاج</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-dust sm:text-base">
        الصفحة التي تبحث عنها لم تُصوَّر بعد، أو حُذفت في النسخة النهائية من
        الفيلم. عُد إلى قاعة العرض الرئيسية أو واصل الاستكشاف.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 font-display text-sm font-bold text-night-950 shadow-[0_8px_30px_-8px_rgba(242,179,61,0.6)] transition-all hover:bg-gold-400 active:scale-95"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
        <Link
          to="/discover"
          className="flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3 font-display text-sm font-bold text-cream transition-all hover:border-gold-500 hover:text-gold-300 active:scale-95"
        >
          <Compass size={16} />
          استكشاف الأفلام
        </Link>
      </div>

      <p className="mt-10 font-display text-[10px] tracking-[0.45em] text-dust/60" dir="ltr">
        SCENE 404 — CUT
      </p>
    </motion.div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useUiStore } from "../store/ui";

/** توست أسفل الشاشة */
export function Toast() {
  const toast = useUiStore((s) => s.toast);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-full border border-gold-500/40 bg-night-850/95 px-5 py-2.5 text-sm font-semibold text-gold-200 shadow-[0_16px_50px_-10px_rgba(242,179,61,0.35)] backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** حالة خطأ مع إعادة محاولة */
export function ErrorState({
  message = "تعذّر جلب البيانات",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-ember-500/25 bg-ember-500/5 px-6 py-14 text-center">
      <AlertTriangle className="text-ember-400" size={34} />
      <div>
        <p className="font-display text-lg font-bold text-cream">{message}</p>
        <p className="mt-1 text-sm text-dust">
          تحقق من اتصالك أو مفتاح API من الإعدادات، ثم أعد المحاولة.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full border border-gold-500/50 bg-gold-500/10 px-6 py-2.5 font-display text-sm font-bold text-gold-300 transition-all hover:bg-gold-500/20 active:scale-95"
        >
          <RotateCw size={15} />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

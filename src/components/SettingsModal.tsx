import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, PlugZap, Trash2, Wifi, WifiOff, X, ExternalLink } from "lucide-react";
import { useSettingsStore } from "../store/settings";
import { useUiStore } from "../store/ui";
import { testApiKey } from "../lib/tmdb";

const schema = z.object({
  apiKey: z
    .string()
    .trim()
    .regex(
      /^[a-f0-9]{32}$/i,
      "مفتاح TMDB (v3) يتكوّن من ٣٢ حرفًا وأرقامًا سداسية عشرية (0-9 a-f)"
    ),
});

type FormData = z.infer<typeof schema>;
type TestStatus = "idle" | "testing" | "ok" | "fail";

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useUiStore();
  const showToast = useUiStore((s) => s.showToast);
  const { apiKey, liveMode, setApiKey, setLiveMode, clearApiKey } =
    useSettingsStore();
  const [status, setStatus] = useState<TestStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { apiKey: apiKey || "" },
  });

  useEffect(() => {
    if (settingsOpen) {
      reset({ apiKey: apiKey || "" });
      setStatus("idle");
    }
  }, [settingsOpen, apiKey, reset]);

  const runTest = async () => {
    const key = getValues("apiKey").trim();
    if (!/^[a-f0-9]{32}$/i.test(key)) {
      setStatus("fail");
      return;
    }
    setStatus("testing");
    const ok = await testApiKey(key);
    setStatus(ok ? "ok" : "fail");
  };

  const onSubmit = (data: FormData) => {
    setApiKey(data.apiKey.trim());
    showToast("تم الحفظ — أُفعّل البث الحي من TMDB ✓");
    closeSettings();
  };

  const onClear = () => {
    clearApiKey();
    showToast("عاد التطبيق إلى وضع العرض التجريبي");
    closeSettings();
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-night-950/80 p-4 backdrop-blur-sm"
          onClick={closeSettings}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="إعدادات الاتصال بـ TMDB"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-cream/12 bg-night-900 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between border-b border-cream/10 bg-night-850 px-6 py-4">
              <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-cream">
                <PlugZap className="text-gold-500" size={20} />
                الاتصال بـ TMDB
              </h2>
              <button
                onClick={closeSettings}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-dust transition-all hover:border-ember-400 hover:text-ember-300 active:scale-90"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-3 rounded-lg border border-cream/10 bg-night-950/50 px-4 py-3">
                {liveMode && apiKey ? (
                  <>
                    <Wifi size={18} className="text-mint-400" />
                    <p className="text-sm text-cream/85">
                      الوضع الحالي: <span className="font-bold text-mint-300">بث حي</span> — البيانات تُجلب من TMDB مباشرة
                    </p>
                  </>
                ) : (
                  <>
                    <WifiOff size={18} className="text-gold-500" />
                    <p className="text-sm text-cream/85">
                      الوضع الحالي: <span className="font-bold text-gold-300">عرض تجريبي</span> — بيانات محلية منسّقة
                    </p>
                  </>
                )}
              </div>

              <div>
                <label htmlFor="tmdb-key" className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream/90">
                  <KeyRound size={15} className="text-gold-500" />
                  مفتاح API (الإصدار الثالث v3)
                </label>
                <div className="flex gap-2">
                  <input
                    id="tmdb-key"
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`flex-1 rounded-lg border bg-night-950/70 px-4 py-2.5 font-mono text-sm tracking-wider text-cream outline-none transition-colors placeholder:text-dust/40 ${
                      errors.apiKey
                        ? "border-ember-500/70 focus:border-ember-400"
                        : "border-cream/15 focus:border-gold-500"
                    }`}
                    {...register("apiKey")}
                  />
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={status === "testing"}
                    className="rounded-lg border border-mint-400/40 bg-mint-400/10 px-4 py-2.5 text-sm font-semibold text-mint-300 transition-all hover:bg-mint-400/20 active:scale-95 disabled:opacity-50"
                  >
                    {status === "testing" ? "يفحص…" : "اختبار"}
                  </button>
                </div>
                {errors.apiKey && (
                  <p className="mt-1.5 text-xs text-ember-300">{errors.apiKey.message}</p>
                )}
                {status === "ok" && (
                  <p className="mt-1.5 text-xs font-semibold text-mint-300">✓ المفتاح يعمل — الاتصال ناجح</p>
                )}
                {status === "fail" && (
                  <p className="mt-1.5 text-xs font-semibold text-ember-300">✗ تعذّر الاتصال — تأكد من المفتاح</p>
                )}
              </div>

              <p className="rounded-lg border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-xs leading-6 text-dust">
                احصل على مفتاح مجاني من{" "}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-gold-400 underline-offset-4 hover:underline"
                >
                  إعدادات TMDB
                  <ExternalLink size={11} />
                </a>{" "}
                — دون مفتاح، يبقى التطبيق كامل الميزات بوضع العرض التجريبي (٢٤ فيلمًا منسّقًا بعناية).
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-gold-500 px-6 py-2.5 font-display text-sm font-bold text-night-950 transition-all hover:bg-gold-400 active:scale-95"
                >
                  حفظ وتفعيل البث الحي
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="flex items-center gap-1.5 rounded-full border border-ember-500/40 px-5 py-2.5 text-sm font-semibold text-ember-300 transition-all hover:bg-ember-500/10 active:scale-95"
                  >
                    <Trash2 size={15} />
                    حذف المفتاح
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

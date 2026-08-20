import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bookmark,
  ChevronDown,
  Database,
  Download,
  HardDrive,
  Heart,
  History as HistoryIcon,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import {
  dbClear,
  dbDelete,
  dbEstimate,
  dbExportAll,
  dbGetAll,
  dbName,
  dbPut,
  dbStats,
  dbVersion,
  onDbEvent,
  type DbEvent,
  type StoreName,
  type StorageEstimate,
  type DbStats,
} from "../lib/db";
import { useUiStore } from "../store/ui";
import { fmtInt } from "../lib/format";

const STORE_META: Record<
  StoreName,
  { label: string; desc: string; color: string; icon: ReactNode }
> = {
  users: {
    label: "المستخدمون",
    desc: "الحسابات — كلمات المرور مجزّأة SHA-256",
    color: "text-gold-400",
    icon: <Users size={18} />,
  },
  favorites: {
    label: "المفضلة",
    desc: "أفلام مفضّلة لكل مستخدم — مفتاح مركّب",
    color: "text-ember-400",
    icon: <Heart size={18} />,
  },
  watchlist: {
    label: "قائمة المشاهدة",
    desc: "«سأشاهده لاحقًا» لكل مستخدم",
    color: "text-mint-400",
    icon: <Bookmark size={18} />,
  },
  history: {
    label: "سجل المشاهدة",
    desc: "زيارات صفحات الأفلام — ترقيم تلقائي",
    color: "text-cream/80",
    icon: <HistoryIcon size={18} />,
  },
  kv: { label: "kv", desc: "", color: "", icon: null },
};

const DATA_STORES: StoreName[] = ["users", "favorites", "watchlist", "history"];

const OP_LABEL: Record<DbEvent["op"], string> = {
  put: "كتابة",
  delete: "حذف",
  clear: "تفريغ",
  init: "تهيئة",
  migrate: "ترحيل",
  import: "استيراد",
};

const relTime = (ts: number): string => {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${fmtInt(m)} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${fmtInt(h)} ساعة`;
  return `قبل ${fmtInt(Math.floor(h / 24))} يوم`;
};

const fmtBytes = (b: number): string => {
  if (!b) return "—";
  const units = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  let i = 0;
  let v = b;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 }).format(v)} ${units[i]}`;
};

type Row = Record<string, unknown>;

const rowKey = (store: StoreName, r: Row): IDBValidKey | null => {
  if (store === "users") return String(r.id);
  if (store === "favorites" || store === "watchlist")
    return [String(r.userId), r.id as number];
  if (store === "history") return (r.entryId as number) ?? null;
  return null;
};

const rowSummary = (store: StoreName, r: Row): string => {
  if (store === "users") return `${String(r.name)} · ${String(r.email)}`;
  if (store === "favorites" || store === "watchlist")
    return `${String(r.title)} — التقييم ${Number(r.rating).toFixed(1)}`;
  if (store === "history")
    return `${String(r.title)} · ${relTime(Number(r.visitedAt))}`;
  return "";
};

export default function DatabasePage() {
  const [stats, setStats] = useState<DbStats[]>([]);
  const [estimate, setEstimate] = useState<StorageEstimate>({ usage: 0, quota: 0 });
  const [rows, setRows] = useState<Record<string, Row[]>>({
    users: [],
    favorites: [],
    watchlist: [],
    history: [],
  });
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [expanded, setExpanded] = useState<StoreName | null>(null);
  const [jsonOpen, setJsonOpen] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState<StoreName | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useUiStore((s) => s.showToast);

  const supported = typeof indexedDB !== "undefined";

  const refresh = async () => {
    if (!supported) return;
    setRefreshing(true);
    try {
      const [s, est, u, f, w, h] = await Promise.all([
        dbStats(),
        dbEstimate(),
        dbGetAll<Row>("users"),
        dbGetAll<Row>("favorites"),
        dbGetAll<Row>("watchlist"),
        dbGetAll<Row>("history"),
      ]);
      setStats(s);
      setEstimate(est);
      setRows({ users: u, favorites: f, watchlist: w, history: h });
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
    const off = onDbEvent((e) => {
      setEvents((prev) => [e, ...prev].slice(0, 14));
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => void refresh(), 350);
    });
    return () => {
      off();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => stats.reduce((acc, s) => acc + s.count, 0),
    [stats]
  );
  const usagePct = estimate.quota
    ? Math.max(0.5, Math.min(100, (estimate.usage / estimate.quota) * 100))
    : 0;

  const handleExportAll = async () => {
    const data = await dbExportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cineverse-db-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تصدير قاعدة البيانات كاملة");
  };

  const handleImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
      let n = 0;
      for (const store of DATA_STORES) {
        const list = parsed[store];
        if (Array.isArray(list)) {
          for (const row of list as Row[]) {
            await dbPut(store, row);
            n++;
          }
        }
      }
      showToast(`تم استيراد ${fmtInt(n)} سجلًا بنجاح`);
      await refresh();
    } catch {
      showToast("ملف غير صالح — يجب أن يكون تصديرًا من سينيفرس");
    }
  };

  const handleClear = async (store: StoreName) => {
    if (confirmClear !== store) {
      setConfirmClear(store);
      setTimeout(() => setConfirmClear((c) => (c === store ? null : c)), 3000);
      return;
    }
    await dbClear(store);
    setConfirmClear(null);
    showToast(`تم تفريغ جدول «${STORE_META[store].label}»`);
  };

  const handleDeleteRow = async (store: StoreName, r: Row) => {
    const key = rowKey(store, r);
    if (key === null) return;
    await dbDelete(store, key);
    showToast("حُذف السجل من قاعدة البيانات");
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
        <p className="flex items-center gap-2 text-sm font-semibold text-mint-400">
          <Database size={15} />
          غرفة المحرّك
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-extrabold text-cream md:text-5xl">
            قاعدة <span className="text-outline-gold">البيانات</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-mint-400/40 bg-mint-400/10 px-4 py-1.5 text-xs font-bold text-mint-300">
              <span className="h-2 w-2 animate-blink rounded-full bg-mint-400" />
              {supported ? "IndexedDB · متصلة" : "غير مدعومة في هذا المتصفح"}
            </span>
            <button
              onClick={() => void refresh()}
              aria-label="تحديث"
              className="grid h-8 w-8 place-items-center rounded-full border border-cream/15 text-cream/70 transition-all hover:border-mint-400 hover:text-mint-300 active:scale-90"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {!supported && (
        <div className="mb-8 rounded-xl border border-ember-500/30 bg-ember-500/10 px-5 py-4 text-sm text-ember-300">
          متصفحك لا يدعم IndexedDB — جرّب متصفحًا حديثًا لعرض قاعدة البيانات.
        </div>
      )}

      {/* لوحة الحالة */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-cream/10 bg-night-900/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold text-dust">
            <Database size={14} className="text-gold-500" />
            القاعدة
          </p>
          <p className="mt-2 font-display text-xl font-extrabold text-cream" dir="ltr">
            {dbName()} <span className="text-gold-400">v{fmtInt(dbVersion())}</span>
          </p>
          <p className="mt-1 text-xs text-dust">
            {fmtInt(DATA_STORES.length)} جداول · معاملات وفهارس حقيقية
          </p>
        </div>

        <div className="rounded-xl border border-cream/10 bg-night-900/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold text-dust">
            <Activity size={14} className="text-mint-400" />
            السجلات
          </p>
          <p className="mt-2 font-display text-xl font-extrabold text-cream">
            {fmtInt(total)} <span className="text-sm font-semibold text-dust">سجلًا حيًا</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats.map((s) => (
              <span
                key={s.store}
                className="rounded-full border border-cream/10 bg-night-950/60 px-2.5 py-0.5 text-[10px] text-cream/70"
              >
                {STORE_META[s.store].label}: <b className={STORE_META[s.store].color}>{fmtInt(s.count)}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-cream/10 bg-night-900/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold text-dust">
            <HardDrive size={14} className="text-ember-400" />
            المساحة المستخدمة
          </p>
          <p className="mt-2 font-display text-xl font-extrabold text-cream">
            {fmtBytes(estimate.usage)}
          </p>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-night-950/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-gold-500 to-ember-500"
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-dust" dir="rtl">
            من أصل {fmtBytes(estimate.quota)} مخصّصة للمتصفح
          </p>
        </div>
      </div>

      {/* سجل العمليات الحي */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-cream">
            <span className="h-6 w-1.5 rounded-full bg-mint-400" />
            بث العمليات المباشر
          </h2>
          <span className="text-[11px] text-dust">كل كتابة وحذف على القاعدة يظهر هنا فورًا</span>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-cream/10 bg-night-950/70">
          <div className="flex items-center gap-2 border-b border-cream/8 px-4 py-2">
            <span className="h-2 w-2 animate-blink rounded-full bg-mint-400" />
            <span className="font-mono text-[11px] text-dust" dir="ltr">
              tail -f {dbName()}.log
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto p-2 font-mono text-[11px] leading-6">
            <AnimatePresence initial={false}>
              {events.length === 0 && (
                <p className="px-3 py-4 text-center text-dust">
                  لا عمليات بعد — أضف فيلمًا للمفضلة أو سجّل حسابًا وشاهد الكتابة هنا.
                </p>
              )}
              {events.map((e, i) => (
                <motion.p
                  key={`${e.at}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-1 odd:bg-night-900/50"
                >
                  <span className="text-dust" dir="ltr">
                    {new Date(e.at).toLocaleTimeString("ar-EG")}
                  </span>
                  <span className={`font-bold ${STORE_META[e.store].color || "text-gold-400"}`}>
                    [{e.store}]
                  </span>
                  <span className="rounded bg-night-700 px-1.5 text-cream/80">{OP_LABEL[e.op]}</span>
                  <span className="text-cream/60">{e.label}</span>
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* أدوات التصدير والاستيراد */}
      <section className="mt-10 flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleExportAll()}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 font-display text-sm font-bold text-night-950 transition-all hover:bg-gold-400 active:scale-95"
        >
          <Download size={16} />
          تصدير القاعدة كاملة (JSON)
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-full border border-cream/20 px-6 py-2.5 font-display text-sm font-bold text-cream transition-all hover:border-gold-500 hover:text-gold-300 active:scale-95"
        >
          <Upload size={16} />
          استيراد نسخة
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleImport(e)}
        />
        <p className="text-xs text-dust">
          النسخة تشمل الجداول الأربعة — جرّب التصدير ثم الاستيراد في متصفح آخر.
        </p>
      </section>

      {/* الجداول */}
      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        {DATA_STORES.map((store, si) => {
          const meta = STORE_META[store];
          const list = rows[store] ?? [];
          const isOpen = expanded === store;
          return (
            <motion.article
              key={store}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: si * 0.06 }}
              className="overflow-hidden rounded-xl border border-cream/10 bg-night-900/60"
            >
              <div className="flex items-center justify-between gap-3 border-b border-cream/8 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`${meta.color}`}>{meta.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-cream">
                      {meta.label}
                      <span className="ms-2 font-mono text-[11px] font-normal text-dust" dir="ltr">
                        {store}
                      </span>
                    </h3>
                    <p className="text-[11px] text-dust">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border border-cream/10 bg-night-950/70 px-3 py-1 font-display text-xs font-bold ${meta.color}`}>
                    {fmtInt(list.length)}
                  </span>
                  <button
                    onClick={() => void handleClear(store)}
                    disabled={list.length === 0}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-30 ${
                      confirmClear === store
                        ? "border-ember-500 bg-ember-500 text-cream"
                        : "border-cream/15 text-dust hover:border-ember-500/60 hover:text-ember-300"
                    }`}
                  >
                    {confirmClear === store ? "تأكيد التفريغ؟" : "تفريغ"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setExpanded(isOpen ? null : store)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-xs font-semibold text-cream/70 transition-colors hover:text-gold-300"
                aria-expanded={isOpen}
              >
                {isOpen ? "إخفاء السجلات" : `عرض السجلات (${fmtInt(list.length)})`}
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-72 overflow-y-auto border-t border-cream/8">
                      {list.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-dust">
                          الجدول فارغ — البيانات التي تضيفها في التطبيق تُكتب هنا مباشرة.
                        </p>
                      ) : (
                        list.map((r, ri) => (
                          <div key={ri} className="border-b border-cream/5 last:border-0">
                            <div className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors hover:bg-night-850/60">
                              <p className="min-w-0 truncate text-sm text-cream/85">
                                {rowSummary(store, r)}
                              </p>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  onClick={() => setJsonOpen(jsonOpen === ri ? null : ri)}
                                  className="rounded-md border border-cream/10 px-2 py-1 font-mono text-[10px] text-dust transition-colors hover:border-gold-500 hover:text-gold-300"
                                  dir="ltr"
                                >
                                  JSON
                                </button>
                                <button
                                  onClick={() => void handleDeleteRow(store, r)}
                                  aria-label="حذف السجل"
                                  className="rounded-md border border-cream/10 p-1.5 text-dust transition-colors hover:border-ember-500 hover:text-ember-300"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <AnimatePresence initial={false}>
                              {jsonOpen === ri && (
                                <motion.pre
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  dir="ltr"
                                  className="overflow-x-auto bg-night-950/80 px-5 py-3 font-mono text-[11px] leading-5 text-mint-300"
                                >
                                  {JSON.stringify(r, null, 2)}
                                </motion.pre>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </section>

      {/* ملاحظات المعمارية */}
      <section className="mt-12 rounded-xl border border-gold-500/25 bg-gold-500/5 p-6">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-gold-300">
          <ShieldCheck size={20} />
          كيف تعمل قاعدة البيانات هنا؟
        </h2>
        <div className="mt-4 grid gap-5 text-sm leading-7 text-cream/80 md:grid-cols-2">
          <div>
            <p>
              <b className="text-cream">IndexedDB</b> محرك قاعدة بيانات حقيقي مدمج في
              المتصفح: جداول بمفاتيح أساسية وفهارس (فهرس بريد فريد للمستخدمين، فهرس
              لكل مستخدم في المفضلة وسجل المشاهدة)، معاملات قراءة/كتابة، وترقيم
              تلقائي — وتبقى البيانات بعد إغلاق المتصفح وتعمل دون اتصال.
            </p>
            <p className="mt-3">
              بيانات الأفلام نفسها تُجلب من خوادم{" "}
              <b className="text-cream">TMDB</b> (المصدر الخارجي الحقيقي)، بينما
              حساباتك ومكتبتك وسجلّك تعيش في قاعدتك المحلية هذه.
            </p>
          </div>
          <div>
            <p>
              كلمات المرور لا تُخزّن نصًا صريحًا أبدًا — بل تجزئة{" "}
              <span className="font-mono text-[12px] text-mint-300" dir="ltr">SHA-256</span>{" "}
              عبر WebCrypto. وكل عملية تبادل حساب تُعيد قراءة مكتبتك من الجدول الخاص
              بمالكها، فمكتبة كل مستخدم معزولة عن غيرها.
            </p>
            <p className="mt-3">
              للمزامنة الفعلية بين الأجهزة تُربط هذه الطبقة بخدمة سحابية مثل{" "}
              <b className="text-cream">Supabase (PostgreSQL)</b> أو{" "}
              <b className="text-cream">Firebase</b> — البنية الحالية (مخازن +
              عمليات async) جاهزة لهذا الاستبدال دون تغيير الواجهة.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

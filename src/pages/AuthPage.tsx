import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Ticket,
  User,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "../components/Navbar";
import { useAuthStore, useCurrentUser } from "../store/auth";
import { useUiStore } from "../store/ui";
import { DEMO_MOVIES } from "../lib/demo";
import { posterUrl } from "../lib/tmdb";

const QUOTES = [
  "السينما أجمل اختراعات القرن… تضيء العتمة فينا.",
  "كل فيلم تذكرة سفر، ونحن في المقعد نفسه نطوف العوالم.",
  "في ظلام القاعة نتساوى جميعًا؛ الشاشة وحدها تعرف أسماءنا.",
  "بعض الأفلام تنتهي… وأخرى تبقى تسكننا بعد إغلاق الستارة.",
];

const loginSchema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صالحًا"),
  password: z.string().min(6, "كلمة المرور ٦ أحرف على الأقل"),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم قصير جدًا"),
    email: z.string().email("أدخل بريدًا إلكترونيًا صالحًا"),
    password: z.string().min(6, "كلمة المرور ٦ أحرف على الأقل"),
    confirm: z.string().min(1, "أعد كتابة كلمة المرور"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm"],
  });

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

const inputCls = (hasError: boolean) =>
  `w-full rounded-lg border bg-night-950/60 py-3 pr-11 pl-11 text-sm text-cream placeholder:text-dust/60 outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-ember-500/70 focus:border-ember-400 focus:ring-ember-500/20"
      : "border-cream/15 focus:border-gold-500/70 focus:ring-gold-500/15"
  }`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs font-semibold text-ember-300"
    >
      {msg}
    </motion.p>
  );
}

function PasswordInput({
  register,
  error,
  placeholder,
}: {
  register: object;
  error?: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="relative">
        <Lock size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
        <input
          {...(register as { password: object }).password}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={inputCls(!!error)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-dust transition-colors hover:text-gold-300"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <FieldError msg={error} />
    </>
  );
}

function LoginForm({ switchMode }: { switchMode: () => void }) {
  const login = useAuthStore((s) => s.login);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const [banner, setBanner] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (d: LoginData) => {
    setBanner(null);
    const err = await login(d.email, d.password);
    if (err) {
      setBanner(err);
      return;
    }
    showToast("أهلًا بعودتك إلى القاعة 🎬");
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <AnimatePresence>
        {banner && (
          <motion.p
            key={banner}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -7, 7, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-4 py-2.5 text-xs font-bold text-ember-300"
            role="alert"
          >
            {banner}
          </motion.p>
        )}
      </AnimatePresence>

      <div>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
          <input
            {...register("email")}
            type="email"
            placeholder="البريد الإلكتروني"
            className={inputCls(!!errors.email)}
            dir="rtl"
          />
        </div>
        <FieldError msg={errors.email?.message} />
      </div>

      <PasswordInput
        register={{ password: register("password") }}
        error={errors.password?.message}
        placeholder="كلمة المرور"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-3.5 font-display text-sm font-bold text-night-950 shadow-[0_10px_30px_-8px_rgba(242,179,61,0.5)] transition-all hover:bg-gold-400 active:scale-[0.98] disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            جارٍ فتح الستارة…
          </>
        ) : (
          <>
            <Ticket size={17} />
            دخول القاعة
          </>
        )}
      </button>

      <p className="pt-1 text-center text-xs text-dust">
        ليس لديك حساب؟{" "}
        <button type="button" onClick={switchMode} className="font-bold text-gold-300 underline-offset-4 hover:underline">
          أنشئ تذكرتك الآن
        </button>
      </p>
    </form>
  );
}

function SignupForm({ switchMode }: { switchMode: () => void }) {
  const signup = useAuthStore((s) => s.signup);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const [banner, setBanner] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({ resolver: zodResolver(signupSchema) });

  const pw = watch("password") ?? "";
  const strength =
    (pw.length >= 6 ? 1 : 0) + (pw.length >= 10 ? 1 : 0) + (/[0-9]/.test(pw) && /[a-zA-Z\u0600-\u06FF]/.test(pw) ? 1 : 0);
  const strengthLabel = ["", "ضعيفة", "جيدة", "قوية"][strength];
  const strengthColor = ["bg-night-700", "bg-ember-500", "bg-gold-500", "bg-mint-400"][strength];

  const onSubmit = async (d: SignupData) => {
    setBanner(null);
    const err = await signup(d.name, d.email, d.password);
    if (err) {
      setBanner(err);
      return;
    }
    showToast(`أهلًا بك في سينيفرس يا ${d.name} ✦`);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <AnimatePresence>
        {banner && (
          <motion.p
            key={banner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [0, -7, 7, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-4 py-2.5 text-xs font-bold text-ember-300"
            role="alert"
          >
            {banner}
          </motion.p>
        )}
      </AnimatePresence>

      <div>
        <div className="relative">
          <User size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
          <input
            {...register("name")}
            type="text"
            placeholder="الاسم الكامل"
            className={inputCls(!!errors.name)}
          />
        </div>
        <FieldError msg={errors.name?.message} />
      </div>

      <div>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dust" />
          <input
            {...register("email")}
            type="email"
            placeholder="البريد الإلكتروني"
            className={inputCls(!!errors.email)}
            dir="rtl"
          />
        </div>
        <FieldError msg={errors.email?.message} />
      </div>

      <div>
        <PasswordInput
          register={{ password: register("password") }}
          error={errors.password?.message}
          placeholder="كلمة المرور (٦ أحرف فأكثر)"
        />
        {pw.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i < strength ? strengthColor : "bg-night-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-dust">{strengthLabel}</span>
          </div>
        )}
      </div>

      <PasswordInput
        register={{ password: register("confirm") }}
        error={errors.confirm?.message}
        placeholder="تأكيد كلمة المرور"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-3.5 font-display text-sm font-bold text-night-950 shadow-[0_10px_30px_-8px_rgba(242,179,61,0.5)] transition-all hover:bg-gold-400 active:scale-[0.98] disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            جارٍ حجز المقعد…
          </>
        ) : (
          <>
            <Sparkles size={17} />
            إنشاء الحساب
          </>
        )}
      </button>

      <p className="pt-1 text-center text-xs text-dust">
        لديك حساب بالفعل؟{" "}
        <button type="button" onClick={switchMode} className="font-bold text-gold-300 underline-offset-4 hover:underline">
          سجّل دخولك
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const user = useCurrentUser();
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const [qi, setQi] = useState(0);
  const [demoBusy, setDemoBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const iv = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 5200);
    return () => clearInterval(iv);
  }, []);

  if (user) return null;

  const switchMode = () =>
    setParams({ mode: mode === "login" ? "signup" : "login" });

  const featured = [
    DEMO_MOVIES[0],
    DEMO_MOVIES[7] ?? DEMO_MOVIES[1],
    DEMO_MOVIES[8] ?? DEMO_MOVIES[2],
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 pt-32 pb-16 md:px-8 lg:grid-cols-2"
    >
      {/* العمود البصري */}
      <div className="hidden flex-col items-start lg:flex">
        <p className="font-display text-sm font-semibold tracking-wide text-gold-400">
          ✦ مكتب التذاكر
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold leading-tight text-cream">
          تذكرتك الدائمة
          <br />
          إلى <span className="text-outline-gold">عالم السينما</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-8 text-dust">
          حسابك يحفظ مفضلتك وقائمة مشاهدتك، ويخصّص القاعة باسمك. كل شيء يُخزَّن
          محليًا في متصفحك — لا خوادم ولا تتبع.
        </p>

        <div className="relative mt-10 h-72 w-full max-w-md">
          {featured.map((m, i) => (
            <motion.div
              key={m.id}
              className="absolute top-0 h-64 w-44 overflow-hidden rounded-lg border-2 border-cream/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
              style={{
                insetInlineStart: `${i * 27}%`,
                zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
              }}
              animate={{
                rotate: [-7 + i * 6, -5 + i * 6, -7 + i * 6],
                y: [0, i === 1 ? -10 : -6, 0],
              }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={posterUrl(m.poster, "w342") ?? undefined}
                alt={m.title}
                className="h-full w-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 min-h-16 max-w-md border-r-2 border-gold-500/70 pr-4">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={qi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="font-display text-base leading-8 text-cream/85"
            >
              «{QUOTES[qi]}»
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>

      {/* التذكرة */}
      <div className="relative mx-auto w-full max-w-md">
        <div className="absolute -inset-4 rounded-2xl bg-gold-500/8 blur-2xl" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-xl border border-cream/12 bg-night-900/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur">
          {/* رأس التذكرة */}
          <div className="relative flex items-center justify-between border-b border-dashed border-cream/15 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <div>
                <p className="font-display text-lg font-extrabold leading-none text-cream">
                  تذكرة الدخول
                </p>
                <p className="mt-1 text-[10px] text-dust">سينيفرس · قاعة رقم ١</p>
              </div>
            </div>
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-gold-500" dir="ltr">
              ADMIT·ONE
            </span>
            {/* ثقوب التذكرة */}
            <span className="absolute -right-3 bottom-0 h-6 w-6 translate-y-1/2 rounded-full border border-cream/12 bg-night-950" aria-hidden="true" />
            <span className="absolute -left-3 bottom-0 h-6 w-6 translate-y-1/2 rounded-full border border-cream/12 bg-night-950" aria-hidden="true" />
          </div>

          {/* التبويبات */}
          <div className="flex" role="tablist" aria-label="نوع الدخول">
            {(
              [
                { key: "login", label: "تسجيل الدخول" },
                { key: "signup", label: "حساب جديد" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={mode === t.key}
                onClick={() => setParams({ mode: t.key })}
                className={`relative flex-1 py-3.5 font-display text-sm font-bold transition-colors ${
                  mode === t.key ? "text-gold-300" : "text-dust hover:text-cream"
                }`}
              >
                {t.label}
                {mode === t.key && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-gold-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="px-6 py-6">
            {mode === "login" ? (
              <LoginForm switchMode={switchMode} />
            ) : (
              <SignupForm switchMode={switchMode} />
            )}

            <div className="my-5 flex items-center gap-3 text-[11px] text-dust">
              <span className="h-px flex-1 border-t border-dashed border-cream/15" />
              أو
              <span className="h-px flex-1 border-t border-dashed border-cream/15" />
            </div>

            <button
              onClick={async () => {
                setDemoBusy(true);
                await loginDemo();
                showToast("دخلت كضيف السينما — استمتع بالعرض");
                navigate("/");
              }}
              disabled={demoBusy}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-mint-400/40 bg-mint-400/10 py-3 font-display text-sm font-bold text-mint-300 transition-all hover:bg-mint-400/20 active:scale-[0.98] disabled:opacity-60"
            >
              {demoBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              دخول سريع كضيف تجريبي
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-dust">
              الحسابات تُحفظ محليًا في متصفحك فقط — بلا خوادم خارجية.
              <br />
              بالمتابعة أنت توافق على{" "}
              <Link to="/" className="text-gold-300 underline-offset-4 hover:underline">
                شروط القاعة
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

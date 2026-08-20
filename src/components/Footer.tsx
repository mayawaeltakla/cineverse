import { Link } from "react-router-dom";
import { Logo } from "./Navbar";
import { useSettingsStore } from "../store/settings";

const genreLinks = [
  { id: 28, name: "أكشن" },
  { id: 18, name: "دراما" },
  { id: 878, name: "خيال علمي" },
  { id: 27, name: "رعب" },
  { id: 10749, name: "رومانسية" },
  { id: 16, name: "أنيميشن" },
];

export default function Footer() {
  const { liveMode, apiKey } = useSettingsStore();
  const live = liveMode && apiKey.length > 0;

  return (
    <footer className="relative mt-24 border-t border-cream/10 bg-night-900/60">
      {/* شريط ثقوب الفيلم */}
      <div className="flex justify-center gap-3 border-b border-cream/5 py-3 opacity-60" aria-hidden="true">
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} className="h-2.5 w-4 rounded-[3px] border border-cream/20" />
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={38} />
            <div>
              <p className="font-display text-2xl font-extrabold text-cream">سينيفرس</p>
              <p className="font-display text-[10px] tracking-[0.4em] text-gold-500" dir="ltr">
                CINEVERSE
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-dust">
            كونٌ سينمائي عربي واحد: ترندات الأسبوع، قاعات الأعلى تقييمًا، اكتشاف
            حسب النوع والسنة، ومكتبة شخصية لا تنساك. بُني بـ React وTypeScript
            ويستمد بياناته من TMDB.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-gold-400">قاعات سريعة</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <li><Link to="/" className="text-cream/75 transition-colors hover:text-gold-300">الرئيسية</Link></li>
            <li><Link to="/discover" className="text-cream/75 transition-colors hover:text-gold-300">استكشاف الأفلام</Link></li>
            <li><Link to="/favorites" className="text-cream/75 transition-colors hover:text-gold-300">مكتبتي</Link></li>
            <li><Link to="/search?q=نجوم" className="text-cream/75 transition-colors hover:text-gold-300">البحث</Link></li>
            {genreLinks.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/discover?genres=${g.id}`}
                  className="text-cream/75 transition-colors hover:text-gold-300"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-gold-400">مصدر البيانات</h3>
          <p className="mt-4 text-sm leading-7 text-dust">
            هذا المنتج يستخدم واجهة TMDB البرمجية لكنه غير معتمد أو موثّق من
            TMDB. أضف مفتاحك الخاص من الإعدادات لتفعيل{" "}
            <span className="text-mint-300">البث الحي</span> — بدونه يعمل التطبيق
            بوضع العرض التجريبي الكامل.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-cream/10 bg-night-950/60 px-4 py-3">
            <span className="font-display text-xl font-extrabold tracking-tight" dir="ltr">
              <span className="text-mint-400">TM</span>
              <span className="text-cream">DB</span>
            </span>
            <span className={`h-2 w-2 rounded-full ${live ? "animate-blink bg-mint-400" : "bg-gold-500"}`} />
            <span className="text-xs text-dust">{live ? "متصل — بيانات حية" : "وضع تجريبي"}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/5 py-5 text-center">
        <p className="font-display text-xs text-dust">
          صُنع بحبٍّ للسينما <span className="text-ember-400">✦</span> سينيفرس ٢٠٢٦
          <span className="mx-2 text-cream/25">|</span>
          <span dir="ltr">React · TypeScript · TMDB API</span>
        </p>
      </div>
    </footer>
  );
}

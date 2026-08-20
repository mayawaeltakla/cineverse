import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string;
  createdAt: number;
}

interface AuthState {
  users: User[];
  currentUserId: string | null;
  /** يعيد رسالة خطأ عربية أو null عند النجاح */
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

/** تجزئة SHA-256 عبر WebCrypto مع بديل آمن إن لم يتوفر */
async function hashSecret(secret: string): Promise<string> {
  const input = `cineverse::${secret}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(input)
      );
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* ننتقل للبديل */
  }
  // بديل FNV-1a مزدوج — ليس تشفيرًا حقيقيًا لكنه يمنع تخزين النص الصريح
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 33) ^ input.charCodeAt(i)) >>> 0;
  }
  return `fnv-${h1.toString(16)}${h2.toString(16)}`;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `u-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      signup: async (name, email, password) => {
        await wait(500); // إحساس معالجة حقيقي
        const normalized = email.trim().toLowerCase();
        if (get().users.some((u) => u.email === normalized)) {
          return "هذا البريد مسجّل مسبقًا — جرّب تسجيل الدخول";
        }
        const passHash = await hashSecret(password);
        const user: User = {
          id: makeId(),
          name: name.trim(),
          email: normalized,
          passHash,
          createdAt: Date.now(),
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return null;
      },

      login: async (email, password) => {
        await wait(500);
        const normalized = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === normalized);
        if (!user) return "لا يوجد حساب بهذا البريد — أنشئ حسابًا جديدًا";
        const passHash = await hashSecret(password);
        if (user.passHash !== passHash) return "كلمة المرور غير صحيحة";
        set({ currentUserId: user.id });
        return null;
      },

      loginDemo: async () => {
        await wait(350);
        const demoEmail = "demo@cineverse.app";
        const existing = get().users.find((u) => u.email === demoEmail);
        if (existing) {
          set({ currentUserId: existing.id });
          return;
        }
        const user: User = {
          id: makeId(),
          name: "ضيف السينما",
          email: demoEmail,
          passHash: await hashSecret("demo-pass"),
          createdAt: Date.now(),
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
      },

      logout: () => set({ currentUserId: null }),
    }),
    { name: "cineverse-auth" }
  )
);

/** المستخدم الحالي — null إن لم يكن مسجّلًا */
export const useCurrentUser = (): User | null =>
  useAuthStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);

import { create } from "zustand";
import {
  dbGet,
  dbGetByIndex,
  dbKvGet,
  dbKvSet,
  dbPut,
  migrateLegacy,
  openDb,
} from "../lib/db";

export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string;
  createdAt: number;
}

interface AuthState {
  currentUser: User | null;
  ready: boolean;
  /** يفتح قاعدة البيانات، يرحّل البيانات القديمة، ويستعيد الجلسة */
  init: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
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

let initStarted = false;

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  ready: false,

  init: async () => {
    if (initStarted) return;
    initStarted = true;
    try {
      await openDb();
      await migrateLegacy();
      const sid = await dbKvGet<string>("session");
      if (sid) {
        const user = await dbGet<User>("users", sid);
        if (user) set({ currentUser: user });
      }
    } catch (e) {
      console.warn("CineVerse: تعذّر فتح قاعدة البيانات", e);
    } finally {
      set({ ready: true });
    }
  },

  signup: async (name, email, password) => {
    await wait(500);
    const normalized = email.trim().toLowerCase();
    const existing = await dbGetByIndex<User>("users", "by-email", normalized);
    if (existing) return "هذا البريد مسجّل مسبقًا — جرّب تسجيل الدخول";
    const passHash = await hashSecret(password);
    const user: User = {
      id: makeId(),
      name: name.trim(),
      email: normalized,
      passHash,
      createdAt: Date.now(),
    };
    await dbPut("users", user);
    await dbKvSet("session", user.id);
    set({ currentUser: user });
    return null;
  },

  login: async (email, password) => {
    await wait(500);
    const normalized = email.trim().toLowerCase();
    const user = await dbGetByIndex<User>("users", "by-email", normalized);
    if (!user) return "لا يوجد حساب بهذا البريد — أنشئ حسابًا جديدًا";
    const passHash = await hashSecret(password);
    if (user.passHash !== passHash) return "كلمة المرور غير صحيحة";
    await dbKvSet("session", user.id);
    set({ currentUser: user });
    return null;
  },

  loginDemo: async () => {
    await wait(350);
    const demoEmail = "demo@cineverse.app";
    const existing = await dbGetByIndex<User>("users", "by-email", demoEmail);
    if (existing) {
      await dbKvSet("session", existing.id);
      set({ currentUser: existing });
      return;
    }
    const user: User = {
      id: makeId(),
      name: "ضيف السينما",
      email: demoEmail,
      passHash: await hashSecret("demo-pass"),
      createdAt: Date.now(),
    };
    await dbPut("users", user);
    await dbKvSet("session", user.id);
    set({ currentUser: user });
  },

  logout: async () => {
    await dbKvSet("session", null);
    set({ currentUser: null });
  },
}));

/** المستخدم الحالي — null إن لم يكن مسجّلًا */
export const useCurrentUser = (): User | null =>
  useAuthStore((s) => s.currentUser);

/** معرّف مالك البيانات: المستخدم الحالي أو «guest» */
export const useOwnerId = (): string =>
  useAuthStore((s) => s.currentUser?.id ?? "guest");

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

const systemPrefersLight = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: light)").matches;

interface SettingsState {
  apiKey: string;
  liveMode: boolean;
  theme: Theme;
  setApiKey: (key: string) => void;
  setLiveMode: (on: boolean) => void;
  clearApiKey: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

/** إعدادات الاتصال والسمة — محفوظة في المتصفح */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      liveMode: false,
      theme: systemPrefersLight() ? "light" : "dark",
      setApiKey: (key) => set({ apiKey: key, liveMode: key.length > 0 }),
      setLiveMode: (on) => set({ liveMode: on }),
      clearApiKey: () => set({ apiKey: "", liveMode: false }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "cineverse-settings" }
  )
);

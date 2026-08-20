import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  apiKey: string;
  liveMode: boolean;
  setApiKey: (key: string) => void;
  setLiveMode: (on: boolean) => void;
  clearApiKey: () => void;
}

/** إعدادات الاتصال بـ TMDB — محفوظة في المتصفح */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      liveMode: false,
      setApiKey: (key) => set({ apiKey: key, liveMode: key.length > 0 }),
      setLiveMode: (on) => set({ liveMode: on }),
      clearApiKey: () => set({ apiKey: "", liveMode: false }),
    }),
    { name: "cineverse-settings" }
  )
);

import { create } from "zustand";
import type { Movie } from "../types";
import { dbDeleteByIndex, dbGetAllByIndex, dbPut } from "../lib/db";
import { useAuthStore } from "./auth";

export interface HistoryEntry {
  entryId?: number;
  userId: string;
  id: number;
  title: string;
  poster: string | null;
  rating: number;
  releaseDate: string;
  genreIds: number[];
  visitedAt: number;
}

interface HistoryState {
  history: HistoryEntry[];
  ready: boolean;
  hydrate: () => Promise<void>;
  /** يسجّل زيارة فيلم — يتجاهل التكرار خلال ١٠ دقائق */
  logVisit: (movie: Movie) => void;
  clearHistory: () => Promise<void>;
}

const ownerId = () => useAuthStore.getState().currentUser?.id ?? "guest";
const DEDUPE_MS = 10 * 60 * 1000;

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  history: [],
  ready: false,

  hydrate: async () => {
    try {
      const rows = await dbGetAllByIndex<HistoryEntry>("history", "by-user", ownerId());
      const sorted = [...rows].sort((a, b) => b.visitedAt - a.visitedAt).slice(0, 60);
      set({ history: sorted, ready: true });
    } catch (e) {
      console.warn("CineVerse: تعذّر قراءة سجل المشاهدة", e);
      set({ ready: true });
    }
  },

  logVisit: (movie) => {
    const uid = ownerId();
    const last = get().history[0];
    if (last && last.id === movie.id && Date.now() - last.visitedAt < DEDUPE_MS) return;
    const entry: HistoryEntry = {
      userId: uid,
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      releaseDate: movie.releaseDate,
      genreIds: movie.genreIds,
      visitedAt: Date.now(),
    };
    void dbPut("history", entry);
    set((s) => ({ history: [entry, ...s.history.filter((h) => h.id !== movie.id)].slice(0, 60) }));
  },

  clearHistory: async () => {
    set({ history: [] });
    await dbDeleteByIndex("history", "by-user", ownerId());
  },
}));

import { create } from "zustand";
import type { Movie, SavedMovie } from "../types";
import {
  dbDelete,
  dbDeleteByIndex,
  dbGetAllByIndex,
  dbPut,
} from "../lib/db";
import { useAuthStore } from "./auth";

type StoredMovie = SavedMovie & { userId: string; addedAt: number };

interface FavoritesState {
  favorites: SavedMovie[];
  watchlist: SavedMovie[];
  ready: boolean;
  /** قراءة مكتبة المالك الحالي من قاعدة البيانات */
  hydrate: () => Promise<void>;
  toggleFavorite: (movie: Movie) => void;
  toggleWatchlist: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  removeWatchlist: (id: number) => void;
  clearFavorites: () => void;
  clearWatchlist: () => void;
  isFavorite: (id: number) => boolean;
  inWatchlist: (id: number) => boolean;
}

const ownerId = () => useAuthStore.getState().currentUser?.id ?? "guest";

const toStored = (m: Movie, uid: string): StoredMovie => ({
  id: m.id,
  title: m.title,
  poster: m.poster,
  rating: m.rating,
  releaseDate: m.releaseDate,
  genreIds: m.genreIds,
  userId: uid,
  addedAt: Date.now(),
});

const newestFirst = (list: StoredMovie[]): SavedMovie[] =>
  [...list].sort((a, b) => b.addedAt - a.addedAt);

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favorites: [],
  watchlist: [],
  ready: false,

  hydrate: async () => {
    const uid = ownerId();
    try {
      const [favs, watch] = await Promise.all([
        dbGetAllByIndex<StoredMovie>("favorites", "by-user", uid),
        dbGetAllByIndex<StoredMovie>("watchlist", "by-user", uid),
      ]);
      set({ favorites: newestFirst(favs), watchlist: newestFirst(watch), ready: true });
    } catch (e) {
      console.warn("CineVerse: تعذّر قراءة المكتبة من قاعدة البيانات", e);
      set({ ready: true });
    }
  },

  toggleFavorite: (movie) => {
    const uid = ownerId();
    const exists = get().favorites.some((f) => f.id === movie.id);
    set((s) => ({
      favorites: exists
        ? s.favorites.filter((f) => f.id !== movie.id)
        : [toStored(movie, uid), ...s.favorites],
    }));
    void (exists
      ? dbDelete("favorites", [uid, movie.id])
      : dbPut("favorites", toStored(movie, uid)));
  },

  toggleWatchlist: (movie) => {
    const uid = ownerId();
    const exists = get().watchlist.some((f) => f.id === movie.id);
    set((s) => ({
      watchlist: exists
        ? s.watchlist.filter((f) => f.id !== movie.id)
        : [toStored(movie, uid), ...s.watchlist],
    }));
    void (exists
      ? dbDelete("watchlist", [uid, movie.id])
      : dbPut("watchlist", toStored(movie, uid)));
  },

  removeFavorite: (id) => {
    set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) }));
    void dbDelete("favorites", [ownerId(), id]);
  },

  removeWatchlist: (id) => {
    set((s) => ({ watchlist: s.watchlist.filter((f) => f.id !== id) }));
    void dbDelete("watchlist", [ownerId(), id]);
  },

  clearFavorites: () => {
    set({ favorites: [] });
    void dbDeleteByIndex("favorites", "by-user", ownerId());
  },

  clearWatchlist: () => {
    set({ watchlist: [] });
    void dbDeleteByIndex("watchlist", "by-user", ownerId());
  },

  isFavorite: (id) => get().favorites.some((f) => f.id === id),
  inWatchlist: (id) => get().watchlist.some((f) => f.id === id),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Movie, SavedMovie } from "../types";

interface FavoritesState {
  favorites: SavedMovie[];
  watchlist: SavedMovie[];
  toggleFavorite: (movie: Movie) => void;
  toggleWatchlist: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  removeWatchlist: (id: number) => void;
  clearFavorites: () => void;
  clearWatchlist: () => void;
  isFavorite: (id: number) => boolean;
  inWatchlist: (id: number) => boolean;
}

const toSaved = (m: Movie): SavedMovie => ({
  id: m.id,
  title: m.title,
  poster: m.poster,
  rating: m.rating,
  releaseDate: m.releaseDate,
  genreIds: m.genreIds,
});

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      watchlist: [],
      toggleFavorite: (movie) =>
        set((s) => {
          const exists = s.favorites.some((f) => f.id === movie.id);
          return {
            favorites: exists
              ? s.favorites.filter((f) => f.id !== movie.id)
              : [toSaved(movie), ...s.favorites],
          };
        }),
      toggleWatchlist: (movie) =>
        set((s) => {
          const exists = s.watchlist.some((f) => f.id === movie.id);
          return {
            watchlist: exists
              ? s.watchlist.filter((f) => f.id !== movie.id)
              : [toSaved(movie), ...s.watchlist],
          };
        }),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      removeWatchlist: (id) =>
        set((s) => ({ watchlist: s.watchlist.filter((f) => f.id !== id) })),
      clearFavorites: () => set({ favorites: [] }),
      clearWatchlist: () => set({ watchlist: [] }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      inWatchlist: (id) => get().watchlist.some((f) => f.id === id),
    }),
    { name: "cineverse-library" }
  )
);

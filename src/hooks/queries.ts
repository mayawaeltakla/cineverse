import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { DiscoverParams, Movie, MovieDetails, Page } from "../types";
import {
  getDiscover,
  getMovie,
  getNowPlaying,
  getTrending,
  getTopRated,
  getUpcoming,
  getFeatured,
  searchMovies,
} from "../lib/tmdb";
import { useSettingsStore } from "../store/settings";

/** نضمّن وضع الاتصال في المفاتيح كي يُعاد الجلب تلقائيًا عند تبديل الوضع */
function useMode(): string {
  const liveMode = useSettingsStore((s) => s.liveMode);
  const apiKey = useSettingsStore((s) => s.apiKey);
  return liveMode && apiKey ? "live" : "demo";
}

export const useFeatured = (): UseQueryResult<MovieDetails[]> => {
  const mode = useMode();
  return useQuery({ queryKey: ["featured", mode], queryFn: getFeatured, staleTime: 10 * 60 * 1000 });
};

export const useTrending = (): UseQueryResult<Movie[]> => {
  const mode = useMode();
  return useQuery({ queryKey: ["trending", mode], queryFn: getTrending, staleTime: 10 * 60 * 1000 });
};

export const useTopRated = (): UseQueryResult<Movie[]> => {
  const mode = useMode();
  return useQuery({ queryKey: ["top-rated", mode], queryFn: getTopRated, staleTime: 10 * 60 * 1000 });
};

export const useNowPlaying = (): UseQueryResult<Movie[]> => {
  const mode = useMode();
  return useQuery({ queryKey: ["now-playing", mode], queryFn: getNowPlaying, staleTime: 10 * 60 * 1000 });
};

export const useUpcoming = (): UseQueryResult<Movie[]> => {
  const mode = useMode();
  return useQuery({ queryKey: ["upcoming", mode], queryFn: getUpcoming, staleTime: 10 * 60 * 1000 });
};

export const useDiscover = (params: DiscoverParams): UseQueryResult<Page<Movie>> => {
  const mode = useMode();
  return useQuery({
    queryKey: ["discover", mode, params.genres.join(","), params.year, params.sort, params.page],
    queryFn: () => getDiscover(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMovie = (id: number): UseQueryResult<{ details: MovieDetails; similar: Movie[] }> => {
  const mode = useMode();
  return useQuery({
    queryKey: ["movie", mode, id],
    queryFn: () => getMovie(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSearch = (query: string, page: number): UseQueryResult<Page<Movie>> => {
  const mode = useMode();
  return useQuery({
    queryKey: ["search", mode, query, page],
    queryFn: () => searchMovies(query, page),
    enabled: query.trim().length > 1,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

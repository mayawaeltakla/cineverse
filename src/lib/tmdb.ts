import axios from "axios";
import type {
  DiscoverParams,
  Genre,
  Movie,
  MovieDetails,
  Page,
} from "../types";
import { GENRES, demoDetails, demoDiscover, demoNowPlaying, demoSearch, demoTrending, demoTopRated, demoUpcoming, demoFeatured } from "./demo";
import { useSettingsStore } from "../store/settings";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

export const tmdbApi = axios.create({ baseURL: BASE, timeout: 15000 });

export const posterUrl = (
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "w1280" | "original" = "w500"
): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${IMG}/${size}${path}`;
};

export const genreName = (id: number): string =>
  GENRES.find((g) => g.id === id)?.name ?? "غير مصنّف";

export const allGenres: Genre[] = GENRES;

const liveKey = (): string | null => {
  const { apiKey, liveMode } = useSettingsStore.getState();
  return liveMode && apiKey ? apiKey : null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapMovie = (m: any): Movie => ({
  id: m.id,
  title: m.title ?? m.name ?? "بدون عنوان",
  originalTitle: m.original_title ?? m.title ?? "",
  overview: m.overview ?? "",
  rating: typeof m.vote_average === "number" ? m.vote_average : 0,
  votes: m.vote_count ?? 0,
  poster: m.poster_path ?? null,
  backdrop: m.backdrop_path ?? m.poster_path ?? null,
  genreIds: m.genre_ids ?? (m.genres?.map((g: any) => g.id) ?? []),
  releaseDate: m.release_date ?? "",
  popularity: m.popularity ?? 0,
});

const liveParams = (key: string) => ({ api_key: key, language: "ar-SA" });

export async function testApiKey(key: string): Promise<boolean> {
  try {
    const res = await axios.get(`${BASE}/configuration`, {
      params: { api_key: key },
      timeout: 10000,
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function getFeatured(): Promise<MovieDetails[]> {
  const key = liveKey();
  if (!key) return demoFeatured();
  const res = await tmdbApi.get("/trending/movie/week", { params: liveParams(key) });
  return (res.data.results ?? [])
    .slice(0, 5)
    .map((m: any) => ({
      ...mapMovie(m),
      runtime: 0,
      tagline: "",
      genres: (m.genre_ids ?? [])
        .map((gid: number) => GENRES.find((g) => g.id === gid))
        .filter((g: Genre | undefined): g is Genre => Boolean(g)),
      budget: 0,
      revenue: 0,
      originalLanguage: m.original_language ?? "en",
      director: "",
      cast: [],
      videos: [],
    }));
}

export async function getTrending(): Promise<Movie[]> {
  const key = liveKey();
  if (!key) return demoTrending();
  const res = await tmdbApi.get("/trending/movie/week", { params: liveParams(key) });
  return (res.data.results ?? []).map(mapMovie);
}

export async function getTopRated(): Promise<Movie[]> {
  const key = liveKey();
  if (!key) return demoTopRated();
  const res = await tmdbApi.get("/movie/top_rated", { params: liveParams(key) });
  return (res.data.results ?? []).map(mapMovie);
}

export async function getNowPlaying(): Promise<Movie[]> {
  const key = liveKey();
  if (!key) return demoNowPlaying();
  const res = await tmdbApi.get("/movie/now_playing", { params: liveParams(key) });
  return (res.data.results ?? []).map(mapMovie);
}

export async function getUpcoming(): Promise<Movie[]> {
  const key = liveKey();
  if (!key) return demoUpcoming();
  const res = await tmdbApi.get("/movie/upcoming", { params: liveParams(key) });
  return (res.data.results ?? []).map(mapMovie);
}

export async function getDiscover(params: DiscoverParams): Promise<Page<Movie>> {
  const key = liveKey();
  if (!key) return demoDiscover(params);
  const res = await tmdbApi.get("/discover/movie", {
    params: {
      ...liveParams(key),
      with_genres: params.genres.length ? params.genres.join(",") : undefined,
      primary_release_year: params.year || undefined,
      sort_by: params.sort,
      page: params.page,
      "vote_count.gte": params.sort === "vote_average.desc" ? 200 : undefined,
    },
  });
  return {
    page: res.data.page,
    totalPages: Math.min(res.data.total_pages ?? 1, 500),
    totalResults: res.data.total_results ?? 0,
    results: (res.data.results ?? []).map(mapMovie),
  };
}

export async function getMovie(id: number): Promise<{
  details: MovieDetails;
  similar: Movie[];
}> {
  const key = liveKey();
  if (!key) return demoDetails(id);
  const res = await tmdbApi.get(`/movie/${id}`, {
    params: {
      ...liveParams(key),
      append_to_response: "credits,similar,videos",
    },
  });
  const d = res.data;
  const crew: any[] = d.credits?.crew ?? [];
  const cast: any[] = d.credits?.cast ?? [];
  const details: MovieDetails = {
    ...mapMovie(d),
    runtime: d.runtime ?? 0,
    tagline: d.tagline ?? "",
    genres: (d.genres ?? []).map((g: any) => ({
      id: g.id,
      name: g.name || genreName(g.id),
    })),
    budget: d.budget ?? 0,
    revenue: d.revenue ?? 0,
    originalLanguage: d.original_language ?? "en",
    director: crew.find((c) => c.job === "Director")?.name ?? "",
    cast: cast.slice(0, 14).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? "",
      profile: c.profile_path ?? null,
    })),
    videos: (d.videos?.results ?? [])
      .filter((v: any) => v.site === "YouTube")
      .map((v: any) => ({ key: v.key, site: v.site, type: v.type, name: v.name })),
  };
  return {
    details,
    similar: (d.similar?.results ?? []).slice(0, 12).map(mapMovie),
  };
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<Page<Movie>> {
  const key = liveKey();
  if (!key) return demoSearch(query);
  if (!query.trim())
    return { page: 1, totalPages: 0, totalResults: 0, results: [] };
  const res = await tmdbApi.get("/search/movie", {
    params: { ...liveParams(key), query, page, include_adult: false },
  });
  return {
    page: res.data.page,
    totalPages: Math.min(res.data.total_pages ?? 1, 500),
    totalResults: res.data.total_results ?? 0,
    results: (res.data.results ?? []).map(mapMovie),
  };
}

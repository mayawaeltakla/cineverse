/** الأنواع المشتركة في التطبيق كله */

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  rating: number;
  votes: number;
  /** مسار TMDB (مثل /xxx.jpg) أو رابط كامل في الوضع التجريبي أو null */
  poster: string | null;
  backdrop: string | null;
  genreIds: number[];
  releaseDate: string;
  popularity: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile: string | null;
}

export interface VideoItem {
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  tagline: string;
  genres: Genre[];
  budget: number;
  revenue: number;
  originalLanguage: string;
  director: string;
  cast: CastMember[];
  videos: VideoItem[];
}

export interface Page<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface DiscoverParams {
  genres: number[];
  year: string;
  sort: string;
  page: number;
}

/** ما نحفظه في المفضلة / قائمة المشاهدة */
export interface SavedMovie {
  id: number;
  title: string;
  poster: string | null;
  rating: number;
  releaseDate: string;
  genreIds: number[];
}

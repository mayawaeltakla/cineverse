import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Movie, SavedMovie } from "../types";
import { posterUrl, genreName } from "../lib/tmdb";
import { fmtInt, yearOf } from "../lib/format";
import { useFavoritesStore } from "../store/favorites";
import { useUiStore } from "../store/ui";
import PosterArt from "./PosterArt";
import RatingRing from "./RatingRing";

export type CardData = Pick<
  Movie,
  "id" | "title" | "poster" | "rating" | "releaseDate" | "genreIds"
>;

const asMovie = (c: CardData): Movie => ({
  ...c,
  originalTitle: "",
  overview: "",
  votes: 0,
  backdrop: c.poster,
  popularity: 0,
});

interface Props {
  movie: CardData | SavedMovie;
  index?: number;
  showRating?: boolean;
}

export default function MovieCard({ movie, index = 0, showRating = true }: Props) {
  const { toggleFavorite, toggleWatchlist, isFavorite, inWatchlist } =
    useFavoritesStore();
  const showToast = useUiStore((s) => s.showToast);
  const url = posterUrl(movie.poster, "w342");
  const fav = isFavorite(movie.id);
  const saved = inWatchlist(movie.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.5), ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-40 sm:w-44 md:w-48 shrink-0"
    >
      <Link
        to={`/movie/${movie.id}`}
        className="card-sheen relative block overflow-hidden rounded-lg border border-cream/8 bg-night-800 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/50 hover:shadow-[0_18px_44px_-12px_rgba(242,179,61,0.25)]"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {url ? (
            <img
              src={url}
              alt={`بوستر ${movie.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
          ) : (
            <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
              <PosterArt title={movie.title} seed={movie.id} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-950/95 via-night-950/45 to-transparent" />
          <div className="absolute bottom-2 right-2.5 left-2.5">
            <h3 className="font-display font-bold text-[15px] leading-snug text-cream line-clamp-2 transition-colors group-hover:text-gold-300">
              {movie.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-dust">
              {yearOf(movie.releaseDate)}
              <span className="mx-1.5 text-gold-500/70">•</span>
              {genreName(movie.genreIds[0] ?? -1)}
            </p>
          </div>
          {showRating && movie.rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-night-950/80 border border-cream/10 px-1.5 py-0.5 backdrop-blur-sm">
              <Star size={11} className="fill-gold-500 text-gold-500" />
              <span className="font-display text-xs font-bold text-gold-300" dir="ltr">
                {movie.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* إجراءات سريعة */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 focus-within:opacity-100">
        <motion.button
          whileTap={{ scale: 1.35 }}
          onClick={() => {
            toggleFavorite(asMovie(movie));
            showToast(fav ? "أُزيل من المفضلة" : "أُضيف إلى المفضلة ♥");
          }}
          aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          className={`grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-colors ${
            fav
              ? "border-ember-400/60 bg-ember-500/90 text-cream"
              : "border-cream/15 bg-night-950/80 text-cream/85 hover:border-ember-400 hover:text-ember-300"
          }`}
        >
          <Heart size={15} className={fav ? "fill-current" : ""} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 1.35 }}
          onClick={() => {
            toggleWatchlist(asMovie(movie));
            showToast(saved ? "أُزيل من قائمة المشاهدة" : "أُضيف إلى قائمة المشاهدة");
          }}
          aria-label={saved ? "إزالة من قائمة المشاهدة" : "إضافة إلى قائمة المشاهدة"}
          className={`grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-colors ${
            saved
              ? "border-gold-400/60 bg-gold-500/90 text-night-950"
              : "border-cream/15 bg-night-950/80 text-cream/85 hover:border-gold-400 hover:text-gold-300"
          }`}
        >
          {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </motion.button>
      </div>

      {movie.rating > 0 && (
        <div className="absolute -bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <RatingRing value={movie.rating} size={38} strokeWidth={3} />
        </div>
      )}
    </motion.article>
  );
}

/** شبكة بطاقات (صفحة الاستكشاف / البحث / المفضلة) */
export function MovieGrid({
  movies,
  idPrefix = "g",
}: {
  movies: (CardData | SavedMovie)[];
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((mv, i) => (
        <div key={`${idPrefix}-${mv.id}`} className="[&>article]:w-full">
          <MovieCard movie={mv} index={i % 12} />
        </div>
      ))}
    </div>
  );
}

/** بطاقة بأصوات — تستخدم fmtInt */
export const voteLabel = (votes: number) => `${fmtInt(votes)} صوتًا`;

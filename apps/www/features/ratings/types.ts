export type Rating = { value: number; createdAt: string };

export type RatingHistoryItem = {
  movieId: number;
  value: number;
  updatedAt: string;
  // null quando o TMDB não respondeu para este filme
  movie: {
    id: number;
    title: string;
    year: number | null;
    posterUrl: string | null;
  } | null;
};

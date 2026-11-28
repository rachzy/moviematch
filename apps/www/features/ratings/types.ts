export type Rating = { value: number; createdAt: string };

export type RatingHistoryMovie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

export type RatingHistoryItem = {
  id: string;
  type: 'rating';
  movieId: number;
  value: number;
  createdAt: string;
  updatedAt: string;
  movie: RatingHistoryMovie;
};
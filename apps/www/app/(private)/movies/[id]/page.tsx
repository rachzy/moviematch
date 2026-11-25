import { MovieDetails } from '@/features/movies/ui/MovieDetails';
import { MovieRating } from '@/features/ratings/ui/MovieRating';

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const movieId = Number((await params).id);
  return (
    <div className="movie-page">
      <MovieDetails movieId={movieId} />
      <MovieRating movieId={movieId} />
    </div>
  );
}

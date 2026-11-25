import { MovieRating } from '@/features/ratings/ui/MovieRating';

// Página mínima do filme; o detalhe do TMDB virá em outra feature.
export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MovieRating movieId={Number(id)} />;
}

'use client';

import { useState } from 'react';
import type { Movie } from '@/features/movies/types';
import { MovieSearch } from '@/features/movies/ui/MovieSearch';
import { RateMovieModal } from '@/features/ratings/ui/RateMovieModal';

// A busca (movies) e a janela de avaliar (ratings) se encontram aqui.
export default function SearchPage() {
  const [rating, setRating] = useState<Movie | null>(null);
  return (
    <>
      <MovieSearch onRate={setRating} />
      <RateMovieModal movie={rating} onClose={() => setRating(null)} />
    </>
  );
}

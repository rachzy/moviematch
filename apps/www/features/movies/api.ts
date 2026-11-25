import { http } from '@/shared/lib/http';
import type { Movie, MovieDetails, SearchParams } from './types';

export async function searchMovies(params: SearchParams) {
  const { data } = await http.get<Movie[]>('/movies', { params });
  return data;
}

export async function getMovie(id: number) {
  const { data } = await http.get<MovieDetails>(`/movies/${id}`);
  return data;
}

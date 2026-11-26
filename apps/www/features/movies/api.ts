import { http } from '@/shared/lib/http';
import type { Movie, SearchParams } from './types';

export async function searchMovies(params: SearchParams) {
  const { data } = await http.get<Movie[]>('/movies', { params });
  return data;
}

import { http } from '@/shared/lib/http';
import type { Rating } from './types';

// Sem nota ainda: a API responde 200 com corpo vazio (null).
export async function getMyRating(movieId: number): Promise<Rating | null> {
  const { data } = await http.get<Rating | ''>(`/movies/${movieId}/rating`);
  return data || null;
}

export async function saveRating(
  movieId: number,
  value: number,
): Promise<Rating> {
  const { data } = await http.put<Rating>(`/movies/${movieId}/rating`, {
    value,
  });
  return data;
}

import { http } from '@/shared/lib/http';
import type { Rating } from './types';

// Rotas SUPOSTAS: confirmar com joao
export async function getMyRating(movieId: string) {
  const { data } = await http.get<Rating>(`/movies/${movieId}/rating`);
  return data;
}

export async function saveRating(movieId: string, value: number) {
  const { data } = await http.put<Rating>(`/movies/${movieId}/rating`, {
    value,
  });
  return data;
}

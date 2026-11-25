import { http } from '@/shared/lib/http';
import type { Rating } from './types';

// GET /movies/:id/rating devolve 200 + Rating, ou 404 quando o usuário ainda
// não avaliou. Qualquer outro erro é falha.
export async function getMyRating(movieId: number): Promise<Rating | null> {
  const res = await http.get<Rating>(`/movies/${movieId}/rating`, {
    validateStatus: (s) => s < 300 || s === 404,
  });
  return res.status === 200 ? res.data : null;
}

// Cria ou edita (a API garante uma avaliação por usuário e filme).
export async function saveRating(
  movieId: number,
  value: number,
  comment: string,
): Promise<Rating> {
  const { data } = await http.put<Rating>(`/movies/${movieId}/rating`, {
    value,
    comment,
  });
  return data;
}

export async function deleteRating(movieId: number) {
  await http.delete(`/movies/${movieId}/rating`);
}

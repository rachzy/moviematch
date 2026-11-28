import { http } from '@/shared/lib/http';
import type { Rating, RatingHistoryItem } from './types';

// Contrato (backend no PR #12): GET /movies/:id/rating devolve 200 + Rating,
// ou 404/204 quando o usuário ainda não avaliou. Qualquer outro erro é falha.
export async function getMyRating(movieId: number): Promise<Rating | null> {
  const res = await http.get<Rating>(`/movies/${movieId}/rating`, {
    validateStatus: (s) => s < 300 || s === 404,
  });
  return res.status === 200 ? res.data : null;
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

export async function getRatingHistory(): Promise<RatingHistoryItem[]> {
  const { data } = await http.get<RatingHistoryItem[]>('/ratings/history');
  return data;
}

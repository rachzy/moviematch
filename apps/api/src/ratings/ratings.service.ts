import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { TmdbClient } from '../movies/tmdb.client';
import { RatingRepository } from './rating.repository';

@Injectable()
export class RatingsService {
  constructor(
    private readonly ratings: RatingRepository,
    @Optional() private readonly tmdb?: TmdbClient,
  ) {}

  async get(userId: string, movieId: number) {
    const rating = await this.ratings.find(userId, movieId);
    if (!rating) throw new NotFoundException('Avaliação não encontrada');
    return rating.toPublic();
  }

  async upsert(userId: string, movieId: number, value: number) {
    return (await this.ratings.upsert(userId, movieId, value)).toPublic();
  }

  async getHistory(userId: string) {
    const rows = await this.ratings.findByUser(userId);

    return Promise.all(
      rows.map(async (row) => {
        let movie: {
          id: number;
          title: string;
          year: number | null;
          posterUrl: string | null;
        } = {
          id: row.movieId,
          title: `Filme #${row.movieId}`,
          year: null,
          posterUrl: null,
        };

        if (this.tmdb) {
          try {
            const details = await this.tmdb.getMovie(row.movieId);
            if (details) {
              movie = {
                id: details.id,
                title: details.title,
                year: details.year,
                posterUrl: details.posterUrl,
              };
            }
          } catch {
            // Mantém o fallback básico caso o TMDB falhe para algum filme
          }
        }

        return {
          id: row.id,
          type: 'rating' as const,
          movieId: row.movieId,
          value: row.value,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          movie,
        };
      }),
    );
  }
}
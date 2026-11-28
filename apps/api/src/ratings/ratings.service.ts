import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TmdbClient } from '../movies/tmdb.client';
import { RatingRepository, type RatingData } from './rating.repository';

// Cada item do histórico custa uma chamada ao TMDB, então o histórico é limitado.
const HISTORY_LIMIT = 20;

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    private readonly ratings: RatingRepository,
    private readonly tmdb: TmdbClient,
  ) {}

  // Sempre escopado ao userId do token: só o dono lê, edita ou apaga.
  private async findOrFail(userId: string, movieId: number) {
    const rating = await this.ratings.find(userId, movieId);
    if (!rating) throw new NotFoundException('Avaliação não encontrada');
    return rating;
  }

  async get(userId: string, movieId: number) {
    return (await this.findOrFail(userId, movieId)).toPublic();
  }

  async upsert(userId: string, movieId: number, data: RatingData) {
    return (await this.ratings.upsert(userId, movieId, data)).toPublic();
  }

  async update(userId: string, movieId: number, data: Partial<RatingData>) {
    await this.findOrFail(userId, movieId);
    return (await this.ratings.update(userId, movieId, data)).toPublic();
  }

  async remove(userId: string, movieId: number) {
    await this.findOrFail(userId, movieId);
    await this.ratings.delete(userId, movieId);
  }

  // `movie` é null quando o TMDB falha ou não conhece o filme; o front trata o fallback.
  async getHistory(userId: string) {
    const ratings = await this.ratings.findByUser(userId, HISTORY_LIMIT);
    return Promise.all(
      ratings.map(async (rating) => {
        const movie = await this.tmdb.getMovie(rating.movieId).catch((err) => {
          this.logger.warn(
            `Falha ao buscar filme ${rating.movieId} no TMDB: ${err.message}`,
          );
          return null;
        });
        return {
          ...rating.toPublic(),
          updatedAt: rating.updatedAt,
          movie: movie && {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            posterUrl: movie.posterUrl,
          },
        };
      }),
    );
  }
}

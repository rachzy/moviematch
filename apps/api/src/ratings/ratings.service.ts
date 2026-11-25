import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingRepository } from './rating.repository';
import type { UpsertRatingDto } from './ratings.schemas';

// O match (GET /affinity) é calculado na hora a partir das avaliações,
// então editar ou excluir já muda o resultado na próxima consulta.
@Injectable()
export class RatingsService {
  constructor(private readonly ratings: RatingRepository) {}

  async get(userId: string, movieId: number) {
    const rating = await this.ratings.find(userId, movieId);
    if (!rating) throw new NotFoundException('Avaliação não encontrada');
    return rating.toPublic();
  }

  async upsert(userId: string, movieId: number, dto: UpsertRatingDto) {
    const rating = await this.ratings.upsert(
      userId,
      movieId,
      dto.value,
      dto.comment,
    );
    return rating.toPublic();
  }

  async remove(userId: string, movieId: number) {
    if (!(await this.ratings.remove(userId, movieId)))
      throw new NotFoundException('Avaliação não encontrada');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingRepository } from './rating.repository';

@Injectable()
export class RatingsService {
  constructor(private readonly ratings: RatingRepository) {}

  async get(userId: string, movieId: number) {
    const rating = await this.ratings.find(userId, movieId);
    if (!rating) throw new NotFoundException('Avaliação não encontrada');
    return rating.toPublic();
  }

  async upsert(userId: string, movieId: number, value: number) {
    return (await this.ratings.upsert(userId, movieId, value)).toPublic();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingRepository, type RatingData } from './rating.repository';

@Injectable()
export class RatingsService {
  constructor(private readonly ratings: RatingRepository) {}

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
}

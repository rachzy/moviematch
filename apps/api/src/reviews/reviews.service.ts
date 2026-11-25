import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateReviewDto } from './reviews.schemas';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviews: ReviewsRepository) {}

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const data: { rating?: number; comment?: string | null } = {};
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.comment !== undefined) {
      data.comment = dto.comment === '' ? null : dto.comment;
    }

    const review = await this.reviews.updateOwned(reviewId, userId, data);
    if (!review) await this.failNotOwned(reviewId);
    return review;
  }

  async remove(reviewId: string, userId: string) {
    if (!(await this.reviews.deleteOwned(reviewId, userId))) {
      await this.failNotOwned(reviewId);
    }
    return { deleted: true, id: reviewId };
  }

  // O repository devolveu "nada": distingue 404 (não existe) de 403 (de outro).
  private async failNotOwned(reviewId: string): Promise<never> {
    if (!(await this.reviews.exists(reviewId))) {
      throw new NotFoundException('Avaliação não encontrada');
    }
    throw new ForbiddenException('Sem permissão para alterar esta avaliação');
  }
}

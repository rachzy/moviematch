import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateReviewDto } from './reviews.schemas';

const MAX_DIFF = 4;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.getOwnedReview(reviewId, userId);

    const data: { rating?: number; comment?: string | null } = {};
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.comment !== undefined) {
      data.comment = dto.comment === '' ? null : dto.comment;
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: review.id },
        data,
      });

      await this.recalculateForMovie(tx, userId, review.movieId);
      return updated;
    });
  }

  async remove(reviewId: string, userId: string) {
    const review = await this.getOwnedReview(reviewId, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: review.id } });
      await this.recalculateForMovie(tx, userId, review.movieId);
    });

    return { deleted: true, id: review.id };
  }

  private async getOwnedReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Avaliação não encontrada');
    if (review.userId !== userId) {
      throw new ForbiddenException('Sem permissão para alterar esta avaliação');
    }

    return review;
  }

  private async recalculateForMovie(
    tx: Prisma.TransactionClient,
    userId: string,
    movieId: number,
  ) {
    const others = await tx.review.findMany({
      where: { movieId, userId: { not: userId } },
      select: { userId: true },
    });

    for (const other of others) {
      await this.recalculatePair(tx, userId, other.userId);
    }
  }

  private async recalculatePair(
    tx: Prisma.TransactionClient,
    id1: string,
    id2: string,
  ) {
    const [userAId, userBId] = id1 < id2 ? [id1, id2] : [id2, id1];

    const [reviewsA, reviewsB] = await Promise.all([
      tx.review.findMany({ where: { userId: userAId } }),
      tx.review.findMany({ where: { userId: userBId } }),
    ]);

    const ratingsB = new Map(reviewsB.map((r) => [r.movieId, r.rating]));
    const common = reviewsA.filter((r) => ratingsB.has(r.movieId));

    const score =
      common.length === 0
        ? 0
        : Number(
            (
              (common.reduce((sum, r) => {
                const diff = Math.abs(r.rating - ratingsB.get(r.movieId)!);
                return sum + Math.max(0, 1 - diff / MAX_DIFF);
              }, 0) /
                common.length) *
              100
            ).toFixed(2),
          );

    await tx.match.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, score },
      update: { score },
    });
  }
}
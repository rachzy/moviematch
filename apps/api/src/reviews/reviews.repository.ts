import { Injectable } from '@nestjs/common';
import type { Prisma, Review as ReviewRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { matchScore, Review } from './review.entity';

export type ReviewChanges = { rating?: number; comment?: string | null };

const toEntity = (row: ReviewRow) =>
  new Review(
    row.id,
    row.userId,
    row.movieId,
    row.rating,
    row.comment,
    row.createdAt,
    row.updatedAt,
  );

// Único lugar que fala com o Prisma sobre reviews e matches.
// Escrita + recálculo de match rodam numa transação (isolamento padrão, read
// committed; não usamos Serializable: duas edições simultâneas de usuários
// diferentes podem deixar um score momentaneamente defasado, aceitável aqui).
@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(id: string) {
    return (await this.prisma.review.count({ where: { id } })) > 0;
  }

  // Atualiza só se a review for do usuário (checagem e escrita atômicas).
  // Devolve null se não existir ou for de outro usuário.
  async updateOwned(id: string, userId: string, data: ReviewChanges) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.review.updateMany({
        where: { id, userId },
        data,
      });
      if (count === 0) return null;

      const row = await tx.review.findUniqueOrThrow({ where: { id } });
      await this.recalculateForMovie(tx, userId, row.movieId);
      return toEntity(row);
    });
  }

  // Idem para exclusão. Devolve false se não existir ou for de outro usuário.
  async deleteOwned(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.review.findFirst({ where: { id, userId } });
      if (!row) return false;

      const { count } = await tx.review.deleteMany({ where: { id, userId } });
      if (count === 0) return false;

      await this.recalculateForMovie(tx, userId, row.movieId);
      return true;
    });
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
    const [rowsA, rowsB] = await Promise.all([
      tx.review.findMany({ where: { userId: userAId } }),
      tx.review.findMany({ where: { userId: userBId } }),
    ]);

    const score = matchScore(rowsA.map(toEntity), rowsB.map(toEntity));
    if (score === null) {
      // sem filmes em comum: não deixa match fantasma
      await tx.match.deleteMany({ where: { userAId, userBId } });
      return;
    }
    await tx.match.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, score },
      update: { score },
    });
  }
}

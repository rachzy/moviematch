import { Injectable } from '@nestjs/common';
import { Prisma, type Rating as RatingRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Rating } from './rating.entity';

const toEntity = (row: RatingRow) =>
  new Rating(row.userId, row.movieId, row.value, row.comment, row.createdAt);

// Filmes avaliados em comum com outro usuário, já agregados no banco.
export type SharedRatings = {
  userId: string;
  username: string;
  shared: number; // filmes em comum
  total: number; // total de filmes avaliados pelo outro usuário
  mineTotal: number; // total de filmes avaliados por quem consulta
  weightedSimilarity: number; // soma de peso * (1 - diferença/4)
  weightSum: number; // soma dos pesos (média das duas notas)
};

// Único lugar que fala com o Prisma sobre avaliações.
@Injectable()
export class RatingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(userId: string, movieId: number) {
    const row = await this.prisma.rating.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });
    return row ? toEntity(row) : null;
  }

  async upsert(
    userId: string,
    movieId: number,
    value: number,
    comment: string | null,
  ) {
    const row = await this.prisma.rating.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: { value, comment },
      create: { userId, movieId, value, comment },
    });
    return toEntity(row);
  }

  // Filtra pelo autor no próprio DELETE: só apaga a avaliação de quem pediu.
  async remove(userId: string, movieId: number) {
    const { count } = await this.prisma.rating.deleteMany({
      where: { userId, movieId },
    });
    return count > 0;
  }

  // Só carrega quem tem ao menos `minShared` filmes em comum (nota 1..5 => diferença máx. 4).
  findSharedRatings(userId: string, minShared: number) {
    return this.prisma.$queryRaw<SharedRatings[]>(Prisma.sql`
      SELECT r."userId", u."username",
        COUNT(*)::int AS "shared",
        (SELECT COUNT(*)::int FROM "Rating" WHERE "userId" = r."userId") AS "total",
        (SELECT COUNT(*)::int FROM "Rating" WHERE "userId" = ${userId}) AS "mineTotal",
        SUM((r."value" + m."value") / 2.0 * (1 - ABS(r."value" - m."value") / 4.0))::float AS "weightedSimilarity",
        SUM((r."value" + m."value") / 2.0)::float AS "weightSum"
      FROM "Rating" r
      JOIN "Rating" m ON m."movieId" = r."movieId" AND m."userId" = ${userId}
      JOIN "User" u ON u."id" = r."userId"
      WHERE r."userId" <> ${userId}
      GROUP BY r."userId", u."username"
      HAVING COUNT(*) >= ${minShared}`);
  }
}

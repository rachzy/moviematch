import { Injectable } from '@nestjs/common';
import { Prisma, type Rating as RatingRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Rating } from './rating.entity';

const toEntity = (row: RatingRow) =>
  new Rating(row.userId, row.movieId, row.value, row.comment, row.updatedAt);

export type RatingData = { value: number; comment?: string | null };

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

  async upsert(userId: string, movieId: number, data: RatingData) {
    const row = await this.prisma.rating.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: data,
      create: { userId, movieId, ...data },
    });
    return toEntity(row);
  }

  async update(userId: string, movieId: number, data: Partial<RatingData>) {
    const row = await this.prisma.rating.update({
      where: { userId_movieId: { userId, movieId } },
      data,
    });
    return toEntity(row);
  }

  async delete(userId: string, movieId: number) {
    await this.prisma.rating.delete({
      where: { userId_movieId: { userId, movieId } },
    });
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

  // Mais recentes primeiro; `take` evita disparar centenas de chamadas ao TMDB.
  async findByUser(userId: string, take: number) {
    const rows = await this.prisma.rating.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take,
    });
    return rows.map(toEntity);
  }
}

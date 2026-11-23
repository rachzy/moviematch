import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AffinityQueryDto } from './affinity.schema';

@Injectable()
export class AffinityService {
  constructor(private readonly prisma: PrismaService) {}

  getConnections(
    userId: string,
    query: AffinityQueryDto = { minSharedMovies: 1, limit: 20 },
  ) {
    return this.calculateConnections(userId, query);
  }

  async calculateConnections(
    userId: string,
    query: AffinityQueryDto = { minSharedMovies: 1, limit: 20 },
  ) {
    const minShared = query.minSharedMovies ?? 1;
    const limit = query.limit ?? 20;

    const allRatings = await this.prisma.rating.findMany({
      select: { userId: true, movieId: true, value: true },
    });

    const byUser = new Map<string, Map<number, number>>();
    for (const row of allRatings) {
      if (!byUser.has(row.userId)) byUser.set(row.userId, new Map());
      byUser.get(row.userId)!.set(row.movieId, row.value);
    }

    const baseRatings = byUser.get(userId);
    if (!baseRatings || baseRatings.size === 0) return [];

    const results: Array<{
      targetUserId: string;
      similarity: number;
      coverage: number;
      score: number;
      sharedMovies: number;
    }> = [];

    for (const [otherUserId, otherRatings] of byUser.entries()) {
      if (otherUserId === userId) continue;

      const sharedIds = [...baseRatings.keys()].filter((id) => otherRatings.has(id));
      if (sharedIds.length < minShared) continue;

      const unionSize = new Set([...baseRatings.keys(), ...otherRatings.keys()]).size;
      const coverage = unionSize > 0 ? sharedIds.length / unionSize : 0;

      let weightedDiffSum = 0;
      let weightSum = 0;
      for (const movieId of sharedIds) {
        const a = baseRatings.get(movieId)!;
        const b = otherRatings.get(movieId)!;
        const weight = (a + b) / 2;
        const normDiff = Math.abs(a - b) / 4.5;
        weightedDiffSum += (1 - normDiff) * weight;
        weightSum += weight;
      }

      const similarity = weightSum > 0 ? weightedDiffSum / weightSum : 0;
      results.push({
        targetUserId: otherUserId,
        similarity: Number(similarity.toFixed(4)),
        coverage: Number(coverage.toFixed(4)),
        score: Number((similarity * coverage).toFixed(4)),
        sharedMovies: sharedIds.length,
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
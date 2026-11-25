import { Injectable } from '@nestjs/common';
import { RatingRepository } from '../ratings/rating.repository';
import type { AffinityQueryDto } from './affinity.schemas';

const round = (n: number) => Number(n.toFixed(4));

@Injectable()
export class AffinityService {
  constructor(private readonly ratings: RatingRepository) {}

  // score = similaridade das notas (nos filmes em comum) * cobertura (comum / união).
  async getConnections(
    userId: string,
    { minSharedMovies, limit }: AffinityQueryDto,
  ) {
    const rows = await this.ratings.findSharedRatings(userId, minSharedMovies);
    return rows
      .map((r) => {
        const similarity =
          r.weightSum > 0 ? r.weightedSimilarity / r.weightSum : 0;
        const coverage = r.shared / (r.mineTotal + r.total - r.shared);
        return {
          targetUserId: r.userId,
          username: r.username,
          similarity: round(similarity),
          coverage: round(coverage),
          score: round(similarity * coverage),
          sharedMovies: r.shared,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

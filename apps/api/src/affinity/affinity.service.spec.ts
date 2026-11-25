import type {
  RatingRepository,
  SharedRatings,
} from '../ratings/rating.repository';
import { AffinityService } from './affinity.service';

const row = (over: Partial<SharedRatings>): SharedRatings => ({
  userId: 'u2',
  username: 'bia',
  shared: 1,
  total: 1,
  mineTotal: 1,
  weightedSimilarity: 5,
  weightSum: 5,
  ...over,
});

describe('AffinityService', () => {
  const repo = { findSharedRatings: jest.fn() };
  const service = new AffinityService(repo as unknown as RatingRepository);
  const query = { minSharedMovies: 1, limit: 20 };

  beforeEach(() => jest.resetAllMocks());

  it('sem filmes em comum devolve []', async () => {
    repo.findSharedRatings.mockResolvedValue([]);
    expect(await service.getConnections('u1', query)).toEqual([]);
  });

  it('mesmas notas e mesmos filmes dão score 1', async () => {
    repo.findSharedRatings.mockResolvedValue([row({})]);
    const [r] = await service.getConnections('u1', query);
    expect(r).toMatchObject({
      similarity: 1,
      coverage: 1,
      score: 1,
      sharedMovies: 1,
    });
  });

  it('diferença máxima (1 x 5) dá similaridade 0', async () => {
    // peso 3, (1 - 4/4) = 0
    repo.findSharedRatings.mockResolvedValue([
      row({ weightedSimilarity: 0, weightSum: 3 }),
    ]);
    const [r] = await service.getConnections('u1', query);
    expect(r.similarity).toBe(0);
    expect(r.score).toBe(0);
  });

  it('cobertura = em comum / união e ordena por score, respeitando limit', async () => {
    repo.findSharedRatings.mockResolvedValue([
      row({ userId: 'a', shared: 1, total: 3, mineTotal: 3 }), // cobertura 1/5
      row({
        userId: 'b',
        shared: 3,
        total: 3,
        mineTotal: 3,
        weightedSimilarity: 15,
        weightSum: 15,
      }), // 3/3
    ]);
    const res = await service.getConnections('u1', {
      minSharedMovies: 1,
      limit: 1,
    });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      targetUserId: 'b',
      coverage: 1,
      score: 1,
      sharedMovies: 3,
    });
  });

  it('não expõe e-mail nem outros dados do outro usuário', async () => {
    repo.findSharedRatings.mockResolvedValue([row({})]);
    const [r] = await service.getConnections('u1', query);
    expect(Object.keys(r).sort()).toEqual([
      'coverage',
      'score',
      'sharedMovies',
      'similarity',
      'targetUserId',
      'username',
    ]);
  });

  it('repassa userId e minSharedMovies ao repository', async () => {
    repo.findSharedRatings.mockResolvedValue([]);
    await service.getConnections('u1', { minSharedMovies: 3, limit: 5 });
    expect(repo.findSharedRatings).toHaveBeenCalledWith('u1', 3);
  });
});

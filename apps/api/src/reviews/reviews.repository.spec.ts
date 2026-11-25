import type { PrismaService } from '../prisma/prisma.service';
import { ReviewsRepository } from './reviews.repository';

const row = (userId: string, movieId: number, rating: number) => ({
  id: 'rev-1',
  userId,
  movieId,
  rating,
  comment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('ReviewsRepository', () => {
  const tx = {
    review: {
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    match: { upsert: jest.fn(), deleteMany: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn((cb: (c: typeof tx) => unknown) => cb(tx)),
  };
  const repo = new ReviewsRepository(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((cb) => cb(tx));
  });

  it('updateOwned escreve com where {id, userId} e recalcula o match', async () => {
    tx.review.updateMany.mockResolvedValue({ count: 1 });
    tx.review.findUniqueOrThrow.mockResolvedValue(row('user-a', 194, 5));
    tx.review.findMany
      .mockResolvedValueOnce([{ userId: 'user-b' }])
      .mockResolvedValueOnce([row('user-a', 194, 5)])
      .mockResolvedValueOnce([row('user-b', 194, 5)]);

    const res = await repo.updateOwned('rev-1', 'user-a', { rating: 5 });

    expect(res?.rating).toBe(5);
    expect(tx.review.updateMany).toHaveBeenCalledWith({
      where: { id: 'rev-1', userId: 'user-a' },
      data: { rating: 5 },
    });
    expect(tx.match.upsert).toHaveBeenCalledWith({
      where: { userAId_userBId: { userAId: 'user-a', userBId: 'user-b' } },
      create: { userAId: 'user-a', userBId: 'user-b', score: 100 },
      update: { score: 100 },
    });
  });

  it('updateOwned devolve null (sem recalcular) quando count é 0', async () => {
    tx.review.updateMany.mockResolvedValue({ count: 0 });
    await expect(repo.updateOwned('rev-1', 'intruso', {})).resolves.toBeNull();
    expect(tx.match.upsert).not.toHaveBeenCalled();
  });

  it('deleteOwned remove o match quando não sobra filme em comum', async () => {
    tx.review.findFirst.mockResolvedValue(row('user-a', 194, 5));
    tx.review.deleteMany.mockResolvedValue({ count: 1 });
    tx.review.findMany
      .mockResolvedValueOnce([{ userId: 'user-b' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([row('user-b', 194, 5)]);

    await expect(repo.deleteOwned('rev-1', 'user-a')).resolves.toBe(true);
    expect(tx.match.deleteMany).toHaveBeenCalledWith({
      where: { userAId: 'user-a', userBId: 'user-b' },
    });
    expect(tx.match.upsert).not.toHaveBeenCalled();
  });

  it('deleteOwned devolve false se a review não é do usuário', async () => {
    tx.review.findFirst.mockResolvedValue(null);
    await expect(repo.deleteOwned('rev-1', 'intruso')).resolves.toBe(false);
    expect(tx.review.deleteMany).not.toHaveBeenCalled();
  });

  it('deleteOwned devolve false se outra requisição apagou antes (count 0)', async () => {
    tx.review.findFirst.mockResolvedValue(row('user-a', 194, 5));
    tx.review.deleteMany.mockResolvedValue({ count: 0 });
    await expect(repo.deleteOwned('rev-1', 'user-a')).resolves.toBe(false);
  });
});

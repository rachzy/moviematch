import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const tx = {
    review: {
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    match: {
      upsert: jest.fn(),
    },
  };

  const prisma = {
    review: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb: (client: typeof tx) => unknown) => cb(tx)),
  };

  const service = new ReviewsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((cb) => cb(tx));
  });

  describe('update', () => {
    it('atualiza nota/comentário do autor e recalcula match', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-a',
        movieId: 194,
        rating: 3,
        comment: 'ok',
      });
      tx.review.update.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-a',
        movieId: 194,
        rating: 5,
        comment: 'excelente',
      });
      tx.review.findMany
        .mockResolvedValueOnce([{ userId: 'user-b' }]) // outros que avaliaram o filme 194
        .mockResolvedValueOnce([{ movieId: 194, rating: 5 }]) // reviews user-a
        .mockResolvedValueOnce([{ movieId: 194, rating: 5 }]); // reviews user-b

      const result = await service.update('rev-1', 'user-a', {
        rating: 5,
        comment: 'excelente',// user-a sem reviews restantes
      });

      expect(result.rating).toBe(5);
      expect(tx.match.upsert).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: 'user-a', userBId: 'user-b' } },
        create: { userAId: 'user-a', userBId: 'user-b', score: 100 },
        update: { score: 100 },
      });
    });

    it('lança NotFoundException quando a avaliação não existe', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('inexistente', 'user-a', { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança ForbiddenException quando outro usuário tenta editar', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-a',
        movieId: 194,
        rating: 3,
      });

      await expect(
        service.update('rev-1', 'user-intruso', { rating: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('remove a avaliação do autor e zera match se não sobrar filme em comum', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-a',
        movieId: 194,
        rating: 5,
      });
      tx.review.delete.mockResolvedValue({ id: 'rev-1' });
      tx.review.findMany
        .mockResolvedValueOnce([{ userId: 'user-b' }])
        // user-a sem reviews restantes
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ movieId: 194, rating: 5 }]);

      const res = await service.remove('rev-1', 'user-a');

      expect(res).toEqual({ deleted: true, id: 'rev-1' });
      expect(tx.match.upsert).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: 'user-a', userBId: 'user-b' } },
        create: { userAId: 'user-a', userBId: 'user-b', score: 0 },
        update: { score: 0 },
      });
    });

    it('lança ForbiddenException quando outro usuário tenta excluir', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-a',
        movieId: 194,
        rating: 5,
      });

      await expect(service.remove('rev-1', 'user-intruso')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
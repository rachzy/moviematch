import { MoviesService } from './movies.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('MoviesService', () => {
  const ratingMock = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };

  const prisma = {
    rating: ratingMock,
  } as unknown as PrismaService;

  const service = new MoviesService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRating', () => {
    it('busca avaliação por userId_movieId', async () => {
      const record = {
        id: 'rating-1',
        userId: 'user-1',
        movieId: 10,
        value: 5,
      };
      ratingMock.findUnique.mockResolvedValue(record);

      const result = await service.getUserRating('user-1', 10);

      expect(result).toBe(record);
      expect(ratingMock.findUnique).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 'user-1', movieId: 10 } },
      });
    });

    it('retorna null quando não há avaliação', async () => {
      ratingMock.findUnique.mockResolvedValue(null);

      await expect(service.getUserRating('user-1', 99)).resolves.toBeNull();
    });
  });

  describe('upsertUserRating', () => {
    it('cria ou atualiza avaliação via prisma.rating.upsert', async () => {
      const record = {
        id: 'rating-1',
        userId: 'user-1',
        movieId: 10,
        value: 4,
      };
      ratingMock.upsert.mockResolvedValue(record);

      const result = await service.upsertUserRating('user-1', 10, 4);

      expect(result).toBe(record);
      expect(ratingMock.upsert).toHaveBeenCalledWith({
        where: { userId_movieId: { userId: 'user-1', movieId: 10 } },
        update: { value: 4 },
        create: { userId: 'user-1', movieId: 10, value: 4 },
      });
    });
  });
});
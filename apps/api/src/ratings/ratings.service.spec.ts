import { NotFoundException } from '@nestjs/common';
import { Rating } from './rating.entity';
import type { RatingRepository } from './rating.repository';
import { RatingsService } from './ratings.service';
import { upsertRatingSchema } from './ratings.schemas';

describe('RatingsService', () => {
  const repo = { find: jest.fn(), upsert: jest.fn() };
  const service = new RatingsService(repo as unknown as RatingRepository);

  beforeEach(() => jest.resetAllMocks());

  it('get devolve a avaliação do usuário', async () => {
    repo.find.mockResolvedValue(new Rating('u1', 10, 5));
    expect(await service.get('u1', 10)).toEqual({ movieId: 10, value: 5 });
    expect(repo.find).toHaveBeenCalledWith('u1', 10);
  });

  it('get lança NotFoundException sem avaliação', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.get('u1', 99)).rejects.toThrow(NotFoundException);
  });

  it('upsert grava e devolve a avaliação', async () => {
    repo.upsert.mockResolvedValue(new Rating('u1', 10, 4));
    expect(await service.upsert('u1', 10, 4)).toEqual({
      movieId: 10,
      value: 4,
    });
    expect(repo.upsert).toHaveBeenCalledWith('u1', 10, 4);
  });

  it.each([0, 6, 3.5, '4', undefined])('schema rejeita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(false);
  });

  it.each([1, 5])('schema aceita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(true);
  });
});

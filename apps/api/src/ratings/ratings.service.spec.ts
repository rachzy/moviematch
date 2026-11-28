import { NotFoundException } from '@nestjs/common';
import { Rating } from './rating.entity';
import type { RatingRepository } from './rating.repository';
import { RatingsService } from './ratings.service';
import { updateRatingSchema, upsertRatingSchema } from './ratings.schemas';

describe('RatingsService', () => {
  const repo = {
    find: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new RatingsService(repo as unknown as RatingRepository);

  beforeEach(() => jest.resetAllMocks());

  it('get devolve a avaliação do usuário', async () => {
    repo.find.mockResolvedValue(new Rating('u1', 10, 5, 'bom'));
    expect(await service.get('u1', 10)).toEqual({
      movieId: 10,
      value: 5,
      comment: 'bom',
    });
    expect(repo.find).toHaveBeenCalledWith('u1', 10);
  });

  it('get lança NotFoundException sem avaliação', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.get('u1', 99)).rejects.toThrow(NotFoundException);
  });

  it('upsert grava e devolve a avaliação', async () => {
    repo.upsert.mockResolvedValue(new Rating('u1', 10, 4));
    expect(await service.upsert('u1', 10, { value: 4 })).toEqual({
      movieId: 10,
      value: 4,
      comment: null,
    });
    expect(repo.upsert).toHaveBeenCalledWith('u1', 10, { value: 4 });
  });

  it('update parcial só repassa o que veio e escopa pelo dono', async () => {
    repo.find.mockResolvedValue(new Rating('u1', 10, 3));
    repo.update.mockResolvedValue(new Rating('u1', 10, 3, 'ok'));
    expect(await service.update('u1', 10, { comment: 'ok' })).toEqual({
      movieId: 10,
      value: 3,
      comment: 'ok',
    });
    expect(repo.find).toHaveBeenCalledWith('u1', 10);
    expect(repo.update).toHaveBeenCalledWith('u1', 10, { comment: 'ok' });
  });

  it('update lança NotFoundException se não for do usuário/inexistente', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.update('u2', 10, { value: 1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('remove apaga a avaliação do dono', async () => {
    repo.find.mockResolvedValue(new Rating('u1', 10, 3));
    await service.remove('u1', 10);
    expect(repo.delete).toHaveBeenCalledWith('u1', 10);
  });

  it('remove lança NotFoundException sem avaliação do usuário', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.remove('u2', 10)).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it.each([0, 6, 3.5, '4', undefined])('schema rejeita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(false);
  });

  it.each([1, 5])('schema aceita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(true);
  });

  it("schema converte comment '' em null", () => {
    expect(upsertRatingSchema.parse({ value: 3, comment: '  ' }).comment).toBe(
      null,
    );
    expect(updateRatingSchema.parse({ comment: '' })).toEqual({
      comment: null,
    });
  });

  it('PATCH aceita parcial e rejeita corpo vazio', () => {
    expect(updateRatingSchema.safeParse({ value: 2 }).success).toBe(true);
    expect(updateRatingSchema.safeParse({}).success).toBe(false);
    expect(updateRatingSchema.safeParse({ value: 9 }).success).toBe(false);
  });
});

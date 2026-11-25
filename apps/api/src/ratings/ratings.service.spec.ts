import { NotFoundException } from '@nestjs/common';
import { Rating } from './rating.entity';
import type { RatingRepository } from './rating.repository';
import { RatingsService } from './ratings.service';
import { upsertRatingSchema } from './ratings.schemas';

describe('RatingsService', () => {
  const repo = { find: jest.fn(), upsert: jest.fn(), remove: jest.fn() };
  const service = new RatingsService(repo as unknown as RatingRepository);
  const date = new Date('2026-11-20T12:00:00Z');

  beforeEach(() => jest.resetAllMocks());

  it('get devolve a avaliação do usuário', async () => {
    repo.find.mockResolvedValue(new Rating('u1', 10, 5, 'Ótimo', date));
    expect(await service.get('u1', 10)).toEqual({
      movieId: 10,
      value: 5,
      comment: 'Ótimo',
      createdAt: '2026-11-20T12:00:00.000Z',
    });
    expect(repo.find).toHaveBeenCalledWith('u1', 10);
  });

  it('get lança NotFoundException sem avaliação', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.get('u1', 99)).rejects.toThrow(NotFoundException);
  });

  it('upsert grava nota e comentário e devolve a avaliação', async () => {
    repo.upsert.mockResolvedValue(new Rating('u1', 10, 4, null, date));
    expect(await service.upsert('u1', 10, { value: 4, comment: null })).toEqual(
      {
        movieId: 10,
        value: 4,
        comment: null,
        createdAt: '2026-11-20T12:00:00.000Z',
      },
    );
    expect(repo.upsert).toHaveBeenCalledWith('u1', 10, 4, null);
  });

  it('remove apaga a avaliação do próprio usuário', async () => {
    repo.remove.mockResolvedValue(true);
    await expect(service.remove('u1', 10)).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith('u1', 10);
  });

  it('remove lança NotFoundException se não há avaliação do usuário', async () => {
    repo.remove.mockResolvedValue(false);
    await expect(service.remove('u1', 10)).rejects.toThrow(NotFoundException);
  });

  it.each([0, 6, 3.5, '4', undefined])('schema rejeita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(false);
  });

  it.each([1, 5])('schema aceita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(true);
  });

  it.each([undefined, null, '', '   '])(
    'schema transforma comentário vazio (%j) em null',
    (comment) => {
      expect(upsertRatingSchema.parse({ value: 3, comment }).comment).toBe(
        null,
      );
    },
  );

  it('schema apara o comentário e rejeita mais de 500 caracteres', () => {
    expect(
      upsertRatingSchema.parse({ value: 3, comment: ' Bom ' }).comment,
    ).toBe('Bom');
    expect(
      upsertRatingSchema.safeParse({ value: 3, comment: 'a'.repeat(501) })
        .success,
    ).toBe(false);
  });
});

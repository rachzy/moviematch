import { NotFoundException } from '@nestjs/common';
import { Rating } from './rating.entity';
import type { TmdbClient } from '../movies/tmdb.client';
import type { RatingRepository } from './rating.repository';
import { RatingsService } from './ratings.service';
import { upsertRatingSchema } from './ratings.schemas';

describe('RatingsService', () => {
  const repo = { find: jest.fn(), upsert: jest.fn(), findByUser: jest.fn() };
  const tmdb = { getMovie: jest.fn() };
  const service = new RatingsService(
    repo as unknown as RatingRepository,
    tmdb as unknown as TmdbClient,
  );

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

  describe('getHistory', () => {
    const d1 = new Date('2026-01-02');
    const d2 = new Date('2026-01-01');

    it('mantém a ordem do repositório e anexa os dados do filme', async () => {
      repo.findByUser.mockResolvedValue([
        new Rating('u1', 2, 5, d1),
        new Rating('u1', 1, 3, d2),
      ]);
      tmdb.getMovie.mockImplementation(async (id: number) => ({
        id,
        title: `Filme ${id}`,
        year: 2020,
        posterUrl: null,
        overview: '',
        genres: [],
        cast: [],
      }));

      const history = await service.getHistory('u1');

      expect(history.map((h) => h.movieId)).toEqual([2, 1]);
      expect(history[0]).toEqual({
        movieId: 2,
        value: 5,
        updatedAt: d1,
        movie: { id: 2, title: 'Filme 2', year: 2020, posterUrl: null },
      });
      expect(repo.findByUser).toHaveBeenCalledWith('u1', expect.any(Number));
    });

    it('devolve movie null quando o TMDB falha ou não encontra', async () => {
      repo.findByUser.mockResolvedValue([
        new Rating('u1', 1, 3, d1),
        new Rating('u1', 2, 4, d2),
      ]);
      tmdb.getMovie
        .mockRejectedValueOnce(new Error('TMDB indisponível'))
        .mockResolvedValueOnce(null);

      const history = await service.getHistory('u1');

      expect(history.map((h) => h.movie)).toEqual([null, null]);
      expect(history.map((h) => h.value)).toEqual([3, 4]);
    });
  });

  it.each([0, 6, 3.5, '4', undefined])('schema rejeita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(false);
  });

  it.each([1, 5])('schema aceita nota %j', (value) => {
    expect(upsertRatingSchema.safeParse({ value }).success).toBe(true);
  });
});

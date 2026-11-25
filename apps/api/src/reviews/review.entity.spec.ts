import { matchScore, Review } from './review.entity';

const r = (movieId: number, rating: number) =>
  new Review('id', 'u', movieId, rating, null, new Date(), new Date());

describe('matchScore', () => {
  it('sem filmes em comum devolve null', () => {
    expect(matchScore([r(1, 5)], [r(2, 5)])).toBeNull();
    expect(matchScore([], [])).toBeNull();
  });

  it('notas iguais valem 100', () => {
    expect(matchScore([r(1, 3)], [r(1, 3)])).toBe(100);
  });

  it('diferença máxima (1 vs 5) vale 0', () => {
    expect(matchScore([r(1, 1)], [r(1, 5)])).toBe(0);
  });

  it('vários filmes: média só dos em comum', () => {
    // filme 1: diff 0 -> 1; filme 2: diff 2 -> 0.5; filme 3 não é comum
    expect(
      matchScore([r(1, 5), r(2, 5), r(3, 1)], [r(1, 5), r(2, 3), r(4, 1)]),
    ).toBe(75);
  });
});

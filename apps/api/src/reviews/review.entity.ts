// Entity de domínio: o resto da aplicação nunca lida com o tipo do Prisma.
export class Review {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly movieId: number,
    readonly rating: number,
    readonly comment: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}

const MAX_DIFF = 4; // maior diferença possível entre duas notas (1 a 5)

// Score de 0 a 100: média de (1 - diferença/MAX_DIFF) nos filmes em comum.
// Sem filmes em comum devolve null (não há match).
export function matchScore(a: Review[], b: Review[]): number | null {
  const ratingsB = new Map(b.map((r) => [r.movieId, r.rating]));
  const common = a.filter((r) => ratingsB.has(r.movieId));
  if (common.length === 0) return null;

  const sum = common.reduce(
    (acc, r) =>
      acc +
      Math.max(0, 1 - Math.abs(r.rating - ratingsB.get(r.movieId)!) / MAX_DIFF),
    0,
  );
  return Number(((sum / common.length) * 100).toFixed(2));
}

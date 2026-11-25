// Entity de domínio: o resto da aplicação nunca lida com o tipo do Prisma.
export class Rating {
  constructor(
    readonly userId: string,
    readonly movieId: number,
    readonly value: number,
    readonly comment: string | null = null,
    readonly createdAt: Date = new Date(),
  ) {}

  toPublic() {
    return {
      movieId: this.movieId,
      value: this.value,
      comment: this.comment,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

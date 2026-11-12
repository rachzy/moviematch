// Entity de domínio: o resto da aplicação nunca lida com o tipo do Prisma.
export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly username: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
    readonly emailVerifiedAt: Date | null = null,
    readonly tokenExpiresAt: Date | null = null,
    readonly verificationCode: string | null = null,
    readonly codeAttempts: number = 0,
    readonly verificationSentAt: Date | null = null,
  ) {}

  // Representação segura para devolver ao cliente (sem o hash).
  toPublic() {
    return { id: this.id, email: this.email, username: this.username };
  }
}

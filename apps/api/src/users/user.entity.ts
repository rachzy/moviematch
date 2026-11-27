//Entity de domínio
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
    readonly nickname: string | null = null,
    readonly avatarUrl: string | null = null,
    readonly pronouns: string | null = null,
  ) {}

  //Para devolver ao cliente (sem o hash).
  toPublic() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      nickname: this.nickname,
      avatarUrl: this.avatarUrl,
      pronouns: this.pronouns,
    };
  }
}
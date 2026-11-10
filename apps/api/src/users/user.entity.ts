export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly verificationToken?: string | null,
    public readonly tokenExpiresAt?: Date | null,
  ) {}

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
    };
  }
}
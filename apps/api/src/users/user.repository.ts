import { Injectable } from '@nestjs/common';
import type { User as UserRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.entity';

export type CreateUserData = {
  email: string;
  username: string;
  passwordHash: string;
  verificationToken?: string | null;
  tokenExpiresAt?: Date | null;
};

const toEntity = (row: UserRow) =>
  new User(
    row.id,
    row.email,
    row.username,
    row.passwordHash,
    row.createdAt,
    row.tokenExpiresAt,
  );

// Único lugar que fala com o Prisma sobre usuários.
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toEntity(row) : null;
  }

  async findByUsername(username: string) {
    const row = await this.prisma.user.findUnique({ where: { username } });
    return row ? toEntity(row) : null;
  }

  async findByVerificationToken(verificationToken: string) {
    const row = await this.prisma.user.findUnique({
      where: { verificationToken },
    });
    return row ? toEntity(row) : null;
  }

  async markEmailAsVerified(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        verificationToken: null,
        tokenExpiresAt: null,
      },
    });
  }

  async create(data: CreateUserData) {
    return toEntity(await this.prisma.user.create({ data }));
  }

  async updateVerificationToken(userId: string, verificationToken: string, tokenExpiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken,
        tokenExpiresAt,
      },
    });
  }
}

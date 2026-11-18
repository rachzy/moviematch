import { Injectable } from '@nestjs/common';
import { Prisma, type User as UserRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.entity';

export type CreateUserData = {
  email: string;
  username: string;
  passwordHash: string;
  verificationToken?: string | null;
  tokenExpiresAt?: Date | null;
  verificationCode?: string | null;
  verificationSentAt?: Date | null;
};

// Violação de unicidade (e-mail/username) vinda do banco, p.ex. cadastro simultâneo.
export class DuplicateUserError extends Error {
  constructor(readonly field: 'email' | 'username') {
    super(`${field} já cadastrado`);
  }
}

const toEntity = (row: UserRow) =>
  new User(
    row.id,
    row.email,
    row.username,
    row.passwordHash,
    row.createdAt,
    row.emailVerifiedAt,
    row.tokenExpiresAt,
    row.verificationCode,
    row.codeAttempts,
    row.verificationSentAt,
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
        verificationCode: null,
        tokenExpiresAt: null,
        codeAttempts: 0,
      },
    });
  }

  // Soma uma tentativa errada de código e devolve o total.
  async incrementCodeAttempts(userId: string) {
    const row = await this.prisma.user.update({
      where: { id: userId },
      data: { codeAttempts: { increment: 1 } },
    });
    return row.codeAttempts;
  }

  async invalidateCode(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationCode: null },
    });
  }

  async create(data: CreateUserData) {
    try {
      return toEntity(await this.prisma.user.create({ data }));
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const target = String(err.meta?.target);
        throw new DuplicateUserError(
          target.includes('username') ? 'username' : 'email',
        );
      }
      throw err;
    }
  }

  async updateVerificationToken(
    userId: string,
    verificationToken: string,
    verificationCode: string,
    tokenExpiresAt: Date,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken,
        verificationCode,
        tokenExpiresAt,
        codeAttempts: 0,
        verificationSentAt: new Date(),
      },
    });
  }
}

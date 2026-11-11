import type { PrismaService } from '../prisma/prisma.service';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

const row = {
  id: '1',
  email: 'a@a.com',
  username: 'alice',
  passwordHash: 'h',
  emailVerifiedAt: null,
  verificationToken: 'hash',
  tokenExpiresAt: new Date('2030-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserRepository', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };
  const repo = new UserRepository(prisma as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

  it('findByVerificationToken devolve a entity com a expiração', async () => {
    prisma.user.findUnique.mockResolvedValue(row);

    const user = await repo.findByVerificationToken('hash');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { verificationToken: 'hash' },
    });
    expect(user).toBeInstanceOf(User);
    expect(user?.tokenExpiresAt).toEqual(row.tokenExpiresAt);
  });

  it('findByVerificationToken devolve null quando não acha', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(repo.findByVerificationToken('x')).resolves.toBeNull();
  });

  it('markEmailAsVerified marca a data e invalida o token', async () => {
    await repo.markEmailAsVerified('1');

    const { where, data } = prisma.user.update.mock.calls[0][0];
    expect(where).toEqual({ id: '1' });
    expect(data.emailVerifiedAt).toBeInstanceOf(Date);
    expect(data.verificationToken).toBeNull();
    expect(data.tokenExpiresAt).toBeNull();
  });

  it('create repassa o token e devolve entity', async () => {
    prisma.user.create.mockResolvedValue(row);
    const data = {
      email: 'a@a.com',
      username: 'alice',
      passwordHash: 'h',
      verificationToken: 'hash',
      tokenExpiresAt: row.tokenExpiresAt,
    };

    const user = await repo.create(data);

    expect(prisma.user.create).toHaveBeenCalledWith({ data });
    expect(user.toPublic()).toEqual({
      id: '1',
      email: 'a@a.com',
      username: 'alice',
    });
  });
});

import { NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import type { UserRepository } from './user.repository';
import { updateProfileSchema } from './users.schemas';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const repo = { findById: jest.fn(), updateProfile: jest.fn() };
  const service = new UsersService(repo as unknown as UserRepository);
  const user = new User('1', 'a@a.com', 'alice', 'hash', new Date());

  beforeEach(() => jest.resetAllMocks());

  it('getProfile devolve o perfil público', async () => {
    repo.findById.mockResolvedValue(user);
    expect(await service.getProfile('1')).toMatchObject({ username: 'alice' });
  });

  it('getProfile lança NotFoundException sem usuário', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getProfile('x')).rejects.toThrow(NotFoundException);
  });

  it('updateProfile lança NotFoundException sem usuário', async () => {
    repo.updateProfile.mockResolvedValue(null);
    await expect(service.updateProfile('x', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateProfile repassa só o que veio (PATCH parcial)', async () => {
    repo.updateProfile.mockResolvedValue(user);
    await service.updateProfile('1', { pronouns: 'ela/dela' });
    expect(repo.updateProfile).toHaveBeenCalledWith('1', {
      pronouns: 'ela/dela',
    });
  });
});

describe('updateProfileSchema', () => {
  it("converte '' em null e aplica trim", () => {
    expect(
      updateProfileSchema.parse({
        nickname: '  ',
        avatarUrl: '',
        pronouns: ' ele ',
      }),
    ).toEqual({ nickname: null, avatarUrl: null, pronouns: 'ele' });
  });

  it('não inclui campos ausentes', () => {
    expect(updateProfileSchema.parse({ nickname: 'Ana' })).toEqual({
      nickname: 'Ana',
    });
  });

  it('rejeita URL inválida e limites excedidos', () => {
    expect(
      updateProfileSchema.safeParse({ avatarUrl: 'ftp://x.com/a.png' }).success,
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({ nickname: 'a'.repeat(51) }).success,
    ).toBe(false);
  });
});

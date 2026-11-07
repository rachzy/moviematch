import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { User } from '../users/user.entity';
import type { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';

const makeUser = (passwordHash: string) =>
  new User('1', 'a@a.com', 'alice', passwordHash, new Date());

describe('AuthService', () => {
  const repo = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };
  const service = new AuthService(repo as unknown as UserRepository);

  beforeEach(() => jest.resetAllMocks());

  describe('register', () => {
    const dto = { email: 'a@a.com', username: 'alice', password: '12345678' };

    it('cria o usuário com a senha em hash e sem expor o hash', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => makeUser(d.passwordHash));

      const result = await service.register(dto);

      expect(result).toEqual({ id: '1', email: 'a@a.com', username: 'alice' });
      expect(repo.create.mock.calls[0][0].passwordHash).not.toBe(dto.password);
    });

    it('rejeita e-mail duplicado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('rejeita username duplicado', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('aceita credenciais corretas', async () => {
      repo.findByEmail.mockResolvedValue(makeUser(await hash('12345678', 4)));
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).resolves.toEqual({ message: 'Login efetuado com sucesso' });
    });

    it('rejeita senha errada', async () => {
      repo.findByEmail.mockResolvedValue(makeUser(await hash('12345678', 4)));
      await expect(
        service.login({ email: 'a@a.com', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejeita e-mail inexistente', async () => {
      repo.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

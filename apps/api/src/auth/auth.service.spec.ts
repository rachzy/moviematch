import {
  BadRequestException,
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { createHash } from 'crypto';
import type { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import type { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';

const makeUser = (passwordHash: string, tokenExpiresAt: Date | null = null) =>
  new User('1', 'a@a.com', 'alice', passwordHash, new Date(), tokenExpiresAt);

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

describe('AuthService', () => {
  const repo = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    findByVerificationToken: jest.fn(),
    findByVerificationCode: jest.fn(),
    updateVerificationToken: jest.fn(),
    markEmailAsVerified: jest.fn(),
  };
  const mail = { sendVerificationEmail: jest.fn() };
  const service = new AuthService(
    repo as unknown as UserRepository,
    mail as unknown as MailService,
  );

  beforeEach(() => jest.resetAllMocks());

  describe('register', () => {
    const dto = { email: 'a@a.com', username: 'alice', password: '12345678' };

    const setupOk = () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => makeUser(d.passwordHash));
    };

    it('cria o usuário com a senha em hash e sem expor o hash', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => makeUser(d.passwordHash));

      const result = await service.register(dto);

      expect(result).toEqual({ id: '1', email: 'a@a.com', username: 'alice' });
      expect(repo.create.mock.calls[0][0].passwordHash).not.toBe(dto.password);
    });

    it('guarda só o hash do token (24h) e envia o token puro por e-mail', async () => {
      setupOk();

      await service.register(dto);

      const data = repo.create.mock.calls[0][0];
      const [to, token] = mail.sendVerificationEmail.mock.calls[0];
      expect(to).toBe('a@a.com');
      const code = mail.sendVerificationEmail.mock.calls[0][2];
      expect(token).toHaveLength(64);
      expect(code).toMatch(/^\d{6}$/);
      expect(data.verificationToken).toBe(sha256(token));
      expect(data.verificationCode).toBe(sha256(code));
      const ttl = data.tokenExpiresAt.getTime() - Date.now();
      expect(ttl).toBeGreaterThan(23 * 60 * 60 * 1000);
      expect(ttl).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });

    it('não falha o cadastro se o envio do e-mail falhar', async () => {
      setupOk();
      mail.sendVerificationEmail.mockRejectedValue(new Error('smtp fora'));
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.register(dto)).resolves.toEqual({
        id: '1',
        email: 'a@a.com',
        username: 'alice',
      });
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

    it('não cria usuário nem envia e-mail quando há duplicado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toThrow();
      expect(repo.create).not.toHaveBeenCalled();
      expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    const inFuture = () => new Date(Date.now() + 60_000);

    it('verifica o usuário buscando pelo hash do token', async () => {
      repo.findByVerificationToken.mockResolvedValue(makeUser('x', inFuture()));

      await expect(service.verifyEmail('abc')).resolves.toEqual({
        message: 'E-mail verificado com sucesso!',
      });
      expect(repo.findByVerificationToken).toHaveBeenCalledWith(sha256('abc'));
      expect(repo.markEmailAsVerified).toHaveBeenCalledWith('1');
    });

    it('rejeita token inexistente', async () => {
      repo.findByVerificationToken.mockResolvedValue(null);
      await expect(service.verifyEmail('abc')).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });

    it('rejeita token expirado', async () => {
      repo.findByVerificationToken.mockResolvedValue(
        makeUser('x', new Date(Date.now() - 1000)),
      );
      await expect(service.verifyEmail('abc')).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });

    it('rejeita usuário sem expiração', async () => {
      repo.findByVerificationToken.mockResolvedValue(makeUser('x'));
      await expect(service.verifyEmail('abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmailByCode', () => {
    it('verifica pelo hash do código', async () => {
      repo.findByVerificationCode.mockResolvedValue(
        makeUser('x', new Date(Date.now() + 60_000)),
      );
      await expect(service.verifyEmailByCode('123456')).resolves.toEqual({
        message: 'E-mail verificado com sucesso!',
      });
      expect(repo.findByVerificationCode).toHaveBeenCalledWith(
        sha256('123456'),
      );
      expect(repo.markEmailAsVerified).toHaveBeenCalledWith('1');
    });

    it.each([null, makeUser('x'), makeUser('x', new Date(Date.now() - 1000))])(
      'rejeita código inexistente ou expirado (%#)',
      async (user) => {
        repo.findByVerificationCode.mockResolvedValue(user);
        await expect(service.verifyEmailByCode('123456')).rejects.toThrow(
          BadRequestException,
        );
        expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
      },
    );
  });

  describe('resendVerification', () => {
    it('gera novo token/código e reenvia o e-mail', async () => {
      repo.findByEmail.mockResolvedValue(
        makeUser('x', new Date(Date.now() - 1000)),
      );

      await service.resendVerification('a@a.com');

      const [id, tokenHash, codeHash, expiresAt] =
        repo.updateVerificationToken.mock.calls[0];
      const [, token, code] = mail.sendVerificationEmail.mock.calls[0];
      expect(id).toBe('1');
      expect(tokenHash).toBe(sha256(token));
      expect(codeHash).toBe(sha256(code));
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('não revela se o e-mail existe', async () => {
      repo.findByEmail.mockResolvedValue(null);
      await expect(
        service.resendVerification('x@x.com'),
      ).resolves.toHaveProperty('message');
      expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('rejeita e-mail já verificado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x'));
      await expect(service.resendVerification('a@a.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('avisa quando o envio falha', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x', new Date()));
      mail.sendVerificationEmail.mockRejectedValue(new Error('smtp fora'));
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
      await expect(service.resendVerification('a@a.com')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('aceita credenciais corretas', async () => {
      repo.findByEmail.mockResolvedValue(makeUser(await hash('12345678', 4)));
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).resolves.toEqual({ message: 'Login efetuado com sucesso' });
    });

    it('rejeita login de e-mail não verificado', async () => {
      repo.findByEmail.mockResolvedValue(
        makeUser(await hash('12345678', 4), new Date(Date.now() + 60_000)),
      );
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).rejects.toThrow(UnauthorizedException);
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

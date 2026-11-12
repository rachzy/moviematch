import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { createHash } from 'crypto';
import type { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { DuplicateUserError } from '../users/user.repository';
import type { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
const inFuture = () => new Date(Date.now() + 60_000);

type Opts = Partial<{
  verified: boolean;
  tokenExpiresAt: Date | null;
  code: string | null;
  attempts: number;
  sentAt: Date | null;
}>;
const makeUser = (passwordHash: string, o: Opts = {}) =>
  new User(
    '1',
    'a@a.com',
    'alice',
    passwordHash,
    new Date(),
    o.verified ? new Date() : null,
    o.tokenExpiresAt === undefined ? inFuture() : o.tokenExpiresAt,
    o.code === undefined ? null : o.code,
    o.attempts ?? 0,
    o.sentAt ?? null,
  );

describe('AuthService', () => {
  const repo = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    findByVerificationToken: jest.fn(),
    incrementCodeAttempts: jest.fn(),
    invalidateCode: jest.fn(),
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
      repo.create.mockImplementation(async (d) =>
        makeUser(d.passwordHash, { verified: false }),
      );
    };

    it('cria o usuário com a senha em hash e sem expor o hash', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) =>
        makeUser(d.passwordHash, { verified: false }),
      );

      const result = await service.register(dto);

      expect(result).toEqual({ message: expect.any(String) });
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

      await expect(service.register(dto)).resolves.toHaveProperty('message');
    });

    it('rejeita e-mail duplicado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toMatchObject({
        response: { field: 'email' },
      });
    });

    it('rejeita username duplicado', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toMatchObject({
        response: { field: 'username' },
      });
    });

    it.each(['email', 'username'] as const)(
      'devolve 409 com field quando o banco barra %s duplicado (corrida)',
      async (field) => {
        repo.findByEmail.mockResolvedValue(null);
        repo.findByUsername.mockResolvedValue(null);
        repo.create.mockRejectedValue(new DuplicateUserError(field));
        const err = await service.register(dto).catch((e) => e);
        expect(err).toBeInstanceOf(ConflictException);
        expect(err.getResponse()).toMatchObject({ field });
      },
    );

    it('não cria usuário nem envia e-mail quando há duplicado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x'));
      await expect(service.register(dto)).rejects.toThrow();
      expect(repo.create).not.toHaveBeenCalled();
      expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('verifica o usuário buscando pelo hash do token', async () => {
      repo.findByVerificationToken.mockResolvedValue(makeUser('x'));

      await expect(service.verifyEmail('abc')).resolves.toEqual({
        message: 'E-mail verificado com sucesso!',
      });
      expect(repo.findByVerificationToken).toHaveBeenCalledWith(sha256('abc'));
      expect(repo.markEmailAsVerified).toHaveBeenCalledWith('1');
    });

    it.each([
      ['inexistente', null],
      [
        'expirado',
        makeUser('x', { tokenExpiresAt: new Date(Date.now() - 1000) }),
      ],
      ['sem expiração', makeUser('x', { tokenExpiresAt: null })],
      ['já verificado', makeUser('x', { verified: true })],
    ])('rejeita token %s', async (_, user) => {
      repo.findByVerificationToken.mockResolvedValue(user);
      await expect(service.verifyEmail('abc')).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmailByCode', () => {
    const withCode = (o: Opts = {}) =>
      makeUser('x', { code: sha256('123456'), ...o });

    it('verifica pelo e-mail e hash do código', async () => {
      repo.findByEmail.mockResolvedValue(withCode());
      await expect(
        service.verifyEmailByCode('a@a.com', '123456'),
      ).resolves.toEqual({ message: 'E-mail verificado com sucesso!' });
      expect(repo.markEmailAsVerified).toHaveBeenCalledWith('1');
    });

    it('código errado conta tentativa e rejeita', async () => {
      repo.findByEmail.mockResolvedValue(withCode());
      repo.incrementCodeAttempts.mockResolvedValue(1);
      await expect(
        service.verifyEmailByCode('a@a.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.incrementCodeAttempts).toHaveBeenCalledWith('1');
      expect(repo.invalidateCode).not.toHaveBeenCalled();
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });

    it('invalida o código na 5ª tentativa errada', async () => {
      repo.findByEmail.mockResolvedValue(withCode({ attempts: 4 }));
      repo.incrementCodeAttempts.mockResolvedValue(5);
      await expect(
        service.verifyEmailByCode('a@a.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.invalidateCode).toHaveBeenCalledWith('1');
    });

    it('tentativas esgotadas: nem o código certo é aceito', async () => {
      repo.findByEmail.mockResolvedValue(withCode({ attempts: 5 }));
      await expect(
        service.verifyEmailByCode('a@a.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });

    it.each([
      ['e-mail inexistente', null],
      ['código invalidado', makeUser('x', { code: null })],
      ['expirado', withCode({ tokenExpiresAt: new Date(Date.now() - 1000) })],
      ['já verificado', withCode({ verified: true })],
    ])('rejeita %s', async (_, user) => {
      repo.findByEmail.mockResolvedValue(user);
      await expect(
        service.verifyEmailByCode('a@a.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.markEmailAsVerified).not.toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    const old = new Date(Date.now() - 120_000);

    it('gera novo token/código e reenvia o e-mail', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x', { sentAt: old }));

      await service.resendVerification('a@a.com');

      const [id, tokenHash, codeHash, expiresAt] =
        repo.updateVerificationToken.mock.calls[0];
      const [, token, code] = mail.sendVerificationEmail.mock.calls[0];
      expect(id).toBe('1');
      expect(tokenHash).toBe(sha256(token));
      expect(codeHash).toBe(sha256(code));
      expect(code).toMatch(/^\d{6}$/);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('responde igual em todos os casos (inexistente, verificado, cooldown, envio ok)', async () => {
      const results = [];
      for (const user of [
        null,
        makeUser('x', { verified: true }),
        makeUser('x', { sentAt: new Date() }),
        makeUser('x', { sentAt: old }),
      ]) {
        repo.findByEmail.mockResolvedValue(user);
        results.push(await service.resendVerification('a@a.com'));
      }
      expect(new Set(results.map((r) => r.message)).size).toBe(1);
      expect(mail.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('dentro do cooldown não gera nem envia nada', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x', { sentAt: new Date() }));
      await service.resendVerification('a@a.com');
      expect(repo.updateVerificationToken).not.toHaveBeenCalled();
      expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('falha no envio não muda a resposta', async () => {
      repo.findByEmail.mockResolvedValue(makeUser('x', { sentAt: old }));
      mail.sendVerificationEmail.mockRejectedValue(new Error('smtp fora'));
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
      await expect(
        service.resendVerification('a@a.com'),
      ).resolves.toHaveProperty('message');
    });
  });

  describe('login', () => {
    it('aceita credenciais corretas', async () => {
      repo.findByEmail.mockResolvedValue(
        makeUser(await hash('12345678', 4), { verified: true }),
      );
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).resolves.toEqual({ message: 'Login efetuado com sucesso' });
    });

    it('rejeita login de e-mail não verificado', async () => {
      repo.findByEmail.mockResolvedValue(makeUser(await hash('12345678', 4)));
      await expect(
        service.login({ email: 'a@a.com', password: '12345678' }),
      ).rejects.toThrow(ForbiddenException);
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

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { DuplicateUserError, UserRepository } from '../users/user.repository';
import type { LoginDto, RegisterDto } from './auth.schemas';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

const RESEND_MESSAGE =
  'Se o e-mail estiver cadastrado e pendente de verificação, enviaremos um novo link e código.';

// No banco ficam só os hashes do token e do código; os valores puros vão apenas no e-mail.
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const newVerification = () => {
  const token = randomBytes(32).toString('hex');
  const code = randomInt(100000, 1000000).toString();
  return {
    token,
    code,
    tokenHash: hashToken(token),
    codeHash: hashToken(code),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UserRepository,
    private readonly mail: MailService,
  ) {}

  // O usuário já existe: falha no envio não deve derrubar a operação.
  private async sendVerification(email: string, token: string, code: string) {
    try {
      await this.mail.sendVerificationEmail(email, token, code);
    } catch (err) {
      this.logger.error('Falha ao enviar e-mail de verificação', err);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.users.findByVerificationToken(hashToken(token));

    if (
      !user ||
      user.emailVerifiedAt ||
      !user.tokenExpiresAt ||
      user.tokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    await this.users.markEmailAsVerified(user.id);
    return { message: 'E-mail verificado com sucesso!' };
  }

  async verifyEmailByCode(email: string, code: string) {
    const user = await this.users.findByEmail(email);

    if (
      !user ||
      user.emailVerifiedAt ||
      !user.verificationCode ||
      !user.tokenExpiresAt ||
      user.tokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Código inválido ou expirado');
    }
    if (user.codeAttempts >= MAX_CODE_ATTEMPTS) {
      throw new BadRequestException(
        'Muitas tentativas. Solicite um novo código.',
      );
    }

    if (user.verificationCode !== hashToken(code)) {
      const attempts = await this.users.incrementCodeAttempts(user.id);
      if (attempts >= MAX_CODE_ATTEMPTS) {
        await this.users.invalidateCode(user.id);
      }
      throw new BadRequestException('Código inválido ou expirado');
    }

    await this.users.markEmailAsVerified(user.id);
    return { message: 'E-mail verificado com sucesso!' };
  }

  async register({ email, username, password }: RegisterDto) {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException({
        message: 'E-mail já cadastrado',
        field: 'email',
      });
    }
    if (await this.users.findByUsername(username)) {
      throw new ConflictException({
        message: 'Username já em uso',
        field: 'username',
      });
    }
    const passwordHash = await hash(password, 10);
    const v = newVerification();
    try {
      await this.users.create({
        email,
        username,
        passwordHash,
        verificationToken: v.tokenHash,
        verificationCode: v.codeHash,
        tokenExpiresAt: v.expiresAt,
        verificationSentAt: new Date(),
      });
    } catch (err) {
      // Cadastro simultâneo: o banco barrou o duplicado depois dos findBy*.
      if (err instanceof DuplicateUserError) {
        throw new ConflictException({
          message:
            err.field === 'email'
              ? 'E-mail já cadastrado'
              : 'Username já em uso',
          field: err.field,
        });
      }
      throw err;
    }
    await this.sendVerification(email, v.token, v.code);
    return { message: 'Cadastro realizado! Verifique seu e-mail.' };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmail(email);
    // Mesma mensagem para e-mail inexistente e senha errada.
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verifique seu e-mail antes de fazer login.',
      );
    }

    return { message: 'Login efetuado com sucesso' };
  }

  // Resposta idêntica para qualquer caso (não revela se o e-mail existe nem o cooldown).
  async resendVerification(email: string) {
    const user = await this.users.findByEmail(email);
    const inCooldown =
      user?.verificationSentAt &&
      Date.now() - user.verificationSentAt.getTime() < RESEND_COOLDOWN_MS;

    if (user && !user.emailVerifiedAt && !inCooldown) {
      const v = newVerification();
      await this.users.updateVerificationToken(
        user.id,
        v.tokenHash,
        v.codeHash,
        v.expiresAt,
      );
      await this.sendVerification(email, v.token, v.code);
    }
    return { message: RESEND_MESSAGE };
  }
}

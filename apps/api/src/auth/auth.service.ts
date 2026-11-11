import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UserRepository } from '../users/user.repository';
import type { LoginDto, RegisterDto } from './auth.schemas';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// No banco fica só o hash do token; o valor puro vai apenas no e-mail.
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UserRepository,
    private readonly mail: MailService,
  ) {}

  async verifyEmail(token: string) {
    const user = await this.users.findByVerificationToken(hashToken(token));

    if (!user?.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    await this.users.markEmailAsVerified(user.id);
    return { message: 'E-mail verificado com sucesso!' };
  }

  async register({ email, username, password }: RegisterDto) {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('E-mail já cadastrado');
    }
    if (await this.users.findByUsername(username)) {
      throw new ConflictException('Username já em uso');
    }
    const passwordHash = await hash(password, 10);
    const token = randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await this.users.create({
      email,
      username,
      passwordHash,
      verificationToken: hashToken(token),
      verificationCode: hashToken(code),
      tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });
    // O usuário já existe: falha no envio não deve derrubar o cadastro.
    try {
      await this.mail.sendVerificationEmail(email, token, code);
    } catch (err) {
      this.logger.error('Falha ao enviar e-mail de verificação', err);
    }
    return user.toPublic();
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmail(email);
    // Mesma mensagem para e-mail inexistente e senha errada.
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    if (user.tokenExpiresAt !== null) {
      throw new UnauthorizedException('Por favor, verifique o seu e-mail antes de fazer login.');
    }

    return { message: 'Login efetuado com sucesso' };
  }

  async resendVerification(email: string) {
    const user = await this.users.findByEmail(email);

    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, um novo link de verificação foi enviado.' };
    }
    if (user.tokenExpiresAt === null) {
      throw new BadRequestException('Este e-mail já foi verificado.');
    }

    const token = randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.users.updateVerificationToken(
      user.id, 
      hashToken(token), 
      hashToken(code), 
      tokenExpiresAt
    );

    try {
      await this.mail.sendVerificationEmail(email, token, code);
    } catch (err) {
      this.logger.error('Falha ao reenviar e-mail de verificação', err);
      throw new BadRequestException('Não foi possível enviar o e-mail. Tente novamente mais tarde.');
    }

    return { message: 'E-mail de verificação reenviado com sucesso!' };
  }

  async verifyEmailByCode(code: string) {
    const hashedCode = hashToken(code);
    const user = await this.users.findByVerificationCode(hashedCode);

    if (!user?.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    await this.users.markEmailAsVerified(user.id);
    return { message: 'E-mail verificado com sucesso!' };
  }
}
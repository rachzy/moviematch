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
    const user = await this.users.create({
      email,
      username,
      passwordHash,
      verificationToken: hashToken(token),
      tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });
    // O usuário já existe: falha no envio não deve derrubar o cadastro.
    try {
      await this.mail.sendVerificationEmail(email, token);
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
    return { message: 'Login efetuado com sucesso' };
  }
}

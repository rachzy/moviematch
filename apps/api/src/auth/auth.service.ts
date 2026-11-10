import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import * as crypto from 'crypto';
import { UserRepository } from '../users/user.repository';
import { MailService } from '../mail/mail.service';
import type { LoginDto, RegisterDto } from './auth.schemas';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly mail: MailService,
  ) {}

  async verifyEmail(token: string) {
    const user = await this.users.findByVerificationToken(token);

    if (!user || !user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await this.users.create({
      email,
      username,
      passwordHash,
      verificationToken,
      tokenExpiresAt,
    });
    await this.mail.sendVerificationEmail(email, verificationToken);
    return user.toPublic();
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    return { message: 'Login efetuado com sucesso' };
  }
}
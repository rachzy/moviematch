import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { UserRepository } from '../users/user.repository';
import type { LoginDto, RegisterDto } from './auth.schemas';

@Injectable()
export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register({ email, username, password }: RegisterDto) {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('E-mail já cadastrado');
    }
    if (await this.users.findByUsername(username)) {
      throw new ConflictException('Username já em uso');
    }
    const passwordHash = await hash(password, 10);
    const user = await this.users.create({ email, username, passwordHash });
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

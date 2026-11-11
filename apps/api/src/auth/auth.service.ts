import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: { email: string; password: string }) {
    //Busca o User pelo e-mail
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    //Faz a validação da senha usando o passwordHash do domínio
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    //E enfim gera o Token JWT retornando ao user usando o método toPublic() da entity User para não expor o passwordHash
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: user.toPublic(),
    };
  }
}
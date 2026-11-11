import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    try {
      const payload = this.jwtService.verify(token);
      //Dados do user injetados no request para serem utilizados em outros lugares
      request.user = payload; 
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
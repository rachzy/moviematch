import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export type AuthUser = { id: string; email: string };

/** Usuário autenticado colocado em `request.user` pelo `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);

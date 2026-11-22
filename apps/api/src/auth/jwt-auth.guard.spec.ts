import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const SECRET = 'test-secret';

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: SECRET });
  const guard = new JwtAuthGuard(jwt);

  const run = (authorization?: string) => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: authorization ? { authorization } : {},
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { request, result: guard.canActivate(ctx) };
  };

  it('token válido: libera e preenche request.user', async () => {
    const token = await jwt.signAsync({ sub: '1', email: 'a@a.com' });
    const { request, result } = run(`Bearer ${token}`);
    await expect(result).resolves.toBe(true);
    expect(request.user).toEqual({ id: '1', email: 'a@a.com' });
  });

  it('sem header: 401', async () => {
    await expect(run().result).rejects.toThrow(UnauthorizedException);
  });

  it('esquema diferente de Bearer: 401', async () => {
    await expect(run('Basic xxx').result).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('token assinado com outro segredo: 401', async () => {
    const token = await new JwtService({ secret: 'outro' }).signAsync({
      sub: '1',
      email: 'a@a.com',
    });
    await expect(run(`Bearer ${token}`).result).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('token expirado: 401', async () => {
    const token = await jwt.signAsync(
      { sub: '1', email: 'a@a.com' },
      { expiresIn: -10 },
    );
    await expect(run(`Bearer ${token}`).result).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

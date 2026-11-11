import { http } from '@/shared/lib/http';
import { register, resendVerification, verifyCode, verifyEmail } from './api';

vi.mock('@/shared/lib/http', () => ({ http: { post: vi.fn() } }));

beforeEach(() => {
  vi.mocked(http.post).mockResolvedValue({ data: { message: 'ok' } });
});

describe('auth api', () => {
  it('register faz POST /auth/register', async () => {
    const input = { email: 'a@b.co', username: 'abc', password: 'Password1!' };

    await expect(register(input)).resolves.toEqual({ message: 'ok' });
    expect(http.post).toHaveBeenCalledWith('/auth/register', input);
  });

  it('verifyEmail faz POST /auth/verify-email com o token', async () => {
    await expect(verifyEmail('tok')).resolves.toEqual({ message: 'ok' });
    expect(http.post).toHaveBeenCalledWith('/auth/verify-email', {
      token: 'tok',
    });
  });

  it('verifyCode faz POST /auth/verify-code com e-mail e código', async () => {
    await verifyCode('a@b.co', '123456');
    expect(http.post).toHaveBeenCalledWith('/auth/verify-code', {
      email: 'a@b.co',
      code: '123456',
    });
  });

  it('resendVerification faz POST /auth/resend-verification', async () => {
    await resendVerification('a@b.co');
    expect(http.post).toHaveBeenCalledWith('/auth/resend-verification', {
      email: 'a@b.co',
    });
  });
});

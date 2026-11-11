import { http } from '@/shared/lib/http';
import { register, verifyEmail } from './api';

vi.mock('@/shared/lib/http', () => ({ http: { post: vi.fn(), get: vi.fn() } }));

describe('auth api', () => {
  it('register faz POST /auth/register e devolve o usuário', async () => {
    const user = { id: '1', email: 'a@b.co', username: 'abc' };
    vi.mocked(http.post).mockResolvedValue({ data: user });
    const input = { email: 'a@b.co', username: 'abc', password: 'password1' };

    await expect(register(input)).resolves.toEqual(user);
    expect(http.post).toHaveBeenCalledWith('/auth/register', input);
  });

  it('verifyEmail faz GET /auth/verify-email com o token na query', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { message: 'ok' } });

    await expect(verifyEmail('tok')).resolves.toEqual({ message: 'ok' });
    expect(http.get).toHaveBeenCalledWith('/auth/verify-email', {
      params: { token: 'tok' },
    });
  });
});

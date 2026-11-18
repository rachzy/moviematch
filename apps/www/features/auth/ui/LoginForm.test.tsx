import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '../api';
import { POST_LOGIN_PATH } from '../routes';
import { AuthProvider } from './AuthContext';
import { LoginForm } from './LoginForm';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../api', () => ({ login: vi.fn() }));

function httpError(status: number, data: unknown) {
  const err = new AxiosError('fail');
  err.response = { status, data } as AxiosError['response'];
  return err;
}

async function renderForm() {
  const user = userEvent.setup();
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
  return user;
}

async function submit(
  user: Awaited<ReturnType<typeof renderForm>>,
  email: string,
  password = 'senha1234',
) {
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('LoginForm', () => {
  it('exibe a mensagem da API quando o e-mail não foi verificado (403)', async () => {
    vi.mocked(login).mockRejectedValue(
      httpError(403, { message: 'Verifique seu e-mail antes de entrar.' }),
    );
    const user = await renderForm();
    await submit(user, 'ana@email.com');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Verifique seu e-mail antes de entrar.',
    );
  });

  it('usa a mensagem padrão em 401 sem message e em erros de rede', async () => {
    vi.mocked(login).mockRejectedValueOnce(httpError(401, {}));
    const user = await renderForm();
    await submit(user, 'ana@email.com');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha incorretos.',
    );

    vi.mocked(login).mockRejectedValueOnce(httpError(500, { message: 'x' }));
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Não foi possível entrar agora',
      ),
    );
  });

  it('rejeita e-mail com formato inválido sem chamar a API', async () => {
    const user = await renderForm();
    await submit(user, 'ana@email');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe um e-mail válido.',
    );
    expect(login).not.toHaveBeenCalled();
  });

  it('liga o erro aos campos via aria-describedby', async () => {
    const user = await renderForm();
    expect(screen.getByLabelText('E-mail')).not.toHaveAttribute(
      'aria-describedby',
    );
    await submit(user, '');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('id', 'login-error');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-describedby',
      'login-error',
    );
    expect(screen.getByLabelText('Senha')).toHaveAttribute(
      'aria-describedby',
      'login-error',
    );
  });

  it('salva o token e redireciona uma única vez ao destino pós-login', async () => {
    vi.mocked(login).mockResolvedValue({ message: 'ok', accessToken: 'tok' });
    const user = await renderForm();
    await submit(user, 'ana@email.com');
    await waitFor(() => expect(replace).toHaveBeenCalledWith(POST_LOGIN_PATH));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem('moviematch:auth_token')).toBe('tok');
  });
});

import { AxiosError } from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { register } from '../api';
import { RegisterForm } from './RegisterForm';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../api', () => ({ register: vi.fn() }));

function conflict(message: string) {
  return new AxiosError('x', 'ERR', undefined, undefined, {
    status: 409,
    data: { message },
  } as never);
}

async function fill(email: string, username: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (username) await user.type(screen.getByLabelText('Username'), username);
  if (password) await user.type(screen.getByLabelText(/Senha/), password);
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

beforeEach(() => {
  push.mockReset();
  vi.mocked(register).mockReset();
});

describe('RegisterForm', () => {
  it('mostra erros por campo e não chama a API', async () => {
    render(<RegisterForm />);
    await fill('', '', '');

    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe um username.')).toBeInTheDocument();
    expect(screen.getByText('Crie uma senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(register).not.toHaveBeenCalled();
  });

  it('liga a mensagem de erro ao campo via aria-describedby', async () => {
    render(<RegisterForm />);
    await fill('', '', '');

    const input = screen.getByLabelText('E-mail');
    const id = input.getAttribute('aria-describedby')!;
    expect(document.getElementById(id)).toHaveTextContent(
      'Informe seu e-mail.',
    );
  });

  it('cadastra e redireciona para a tela de verificação', async () => {
    vi.mocked(register).mockResolvedValue({
      id: '1',
      email: 'a@b.co',
      username: 'abc',
    });
    render(<RegisterForm />);
    await fill('  a@b.co ', ' abc ', 'password1');

    expect(register).toHaveBeenCalledWith({
      email: 'a@b.co',
      username: 'abc',
      password: 'password1',
    });
    expect(push).toHaveBeenCalledWith('/register/verify?email=a%40b.co');
  });

  it('409 de e-mail aparece no campo e-mail', async () => {
    vi.mocked(register).mockRejectedValue(conflict('E-mail já cadastrado'));
    render(<RegisterForm />);
    await fill('a@b.co', 'abc', 'password1');

    expect(
      await screen.findByText('Este e-mail já está cadastrado.'),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
  });

  it('409 de username aparece no campo username', async () => {
    vi.mocked(register).mockRejectedValue(conflict('Username já em uso'));
    render(<RegisterForm />);
    await fill('a@b.co', 'abc', 'password1');

    expect(await screen.findByText('Username já em uso.')).toBeInTheDocument();
  });

  it('409 desconhecido vira alerta geral', async () => {
    vi.mocked(register).mockRejectedValue(conflict('Outra coisa'));
    render(<RegisterForm />);
    await fill('a@b.co', 'abc', 'password1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Outra coisa');
  });

  it('erro genérico mostra alerta', async () => {
    vi.mocked(register).mockRejectedValue(new Error('boom'));
    render(<RegisterForm />);
    await fill('a@b.co', 'abc', 'password1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo deu errado',
    );
  });
});

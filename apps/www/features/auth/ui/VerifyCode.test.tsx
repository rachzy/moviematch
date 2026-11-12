import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resendVerification, verifyCode } from '../api';
import { readPendingEmail } from '../pendingEmail';
import { VerifyCode } from './VerifyCode';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../api', () => ({
  verifyCode: vi.fn(),
  resendVerification: vi.fn(),
}));

beforeEach(() => {
  push.mockReset();
  vi.mocked(verifyCode).mockReset().mockResolvedValue({ message: 'ok' });
  vi.mocked(resendVerification)
    .mockReset()
    .mockResolvedValue({ message: 'ok' });
  sessionStorage.clear();
});

describe('VerifyCode', () => {
  it('usa o e-mail do sessionStorage, confirma e vai para o login', async () => {
    sessionStorage.setItem('pendingEmail', 'a@b.co');
    const user = userEvent.setup();
    render(<VerifyCode />);

    expect(await screen.findByText('a@b.co')).toBeInTheDocument();
    await user.keyboard('123456');
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(verifyCode).toHaveBeenCalledWith('a@b.co', '123456');
    expect(push).toHaveBeenCalledWith('/?verified=1');
    expect(readPendingEmail()).toBe('');
  });

  it('reenvia para o e-mail guardado', async () => {
    sessionStorage.setItem('pendingEmail', 'a@b.co');
    const user = userEvent.setup();
    render(<VerifyCode />);

    await user.click(
      await screen.findByRole('button', { name: 'Reenviar código' }),
    );
    expect(resendVerification).toHaveBeenCalledWith('a@b.co');
  });

  it('sem e-mail guardado pede o e-mail e oferece voltar ao cadastro', async () => {
    const user = userEvent.setup();
    render(<VerifyCode />);

    expect(
      await screen.findByRole('link', { name: 'Voltar ao cadastro' }),
    ).toHaveAttribute('href', '/register');
    await user.type(screen.getByLabelText('E-mail'), 'x@y.co');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('x@y.co')).toBeInTheDocument();
    expect(readPendingEmail()).toBe('x@y.co');
  });
});

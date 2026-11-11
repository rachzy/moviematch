import { AxiosError } from 'axios';
import { render, screen } from '@testing-library/react';
import { verifyEmail } from '../api';
import { VerifyEmailStatus } from './VerifyEmailStatus';

vi.mock('../api', () => ({ verifyEmail: vi.fn() }));

function httpError(status: number) {
  return new AxiosError('x', 'ERR', undefined, undefined, {
    status,
  } as never);
}

beforeEach(() => {
  vi.mocked(verifyEmail).mockReset();
});

describe('VerifyEmailStatus', () => {
  it('sem token mostra link inválido e não chama a API', () => {
    render(<VerifyEmailStatus />);
    expect(screen.getByText('Link inválido ou expirado')).toBeInTheDocument();
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('confirma o e-mail com sucesso', async () => {
    vi.mocked(verifyEmail).mockResolvedValue({ message: 'ok' });
    render(<VerifyEmailStatus token="tok" />);

    expect(screen.getByText(/Confirmando/)).toBeInTheDocument();
    expect(await screen.findByText('E-mail confirmado!')).toBeInTheDocument();
    expect(verifyEmail).toHaveBeenCalledWith('tok');
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });

  it('erro 4xx mostra link inválido ou expirado', async () => {
    vi.mocked(verifyEmail).mockRejectedValue(httpError(400));
    render(<VerifyEmailStatus token="tok" />);
    expect(
      await screen.findByText('Link inválido ou expirado'),
    ).toBeInTheDocument();
  });

  it.each([
    ['5xx', httpError(500)],
    ['falha de rede', new AxiosError('Network Error')],
  ])('%s permite tentar de novo', async (_, err) => {
    vi.mocked(verifyEmail).mockRejectedValue(err);
    render(<VerifyEmailStatus token="tok" />);
    expect(
      await screen.findByText('Não foi possível confirmar'),
    ).toBeInTheDocument();
  });
});

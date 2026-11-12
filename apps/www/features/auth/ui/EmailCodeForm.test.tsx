import { AxiosError } from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailCodeForm } from './EmailCodeForm';

function setup(
  onConfirm = vi.fn().mockResolvedValue(undefined),
  onResend = vi.fn().mockResolvedValue(undefined),
) {
  const user = userEvent.setup();
  render(
    <EmailCodeForm email="a@b.co" onConfirm={onConfirm} onResend={onResend} />,
  );
  const box = (n: number) => screen.getByLabelText(`Dígito ${n} de 6`);
  const confirm = () =>
    user.click(screen.getByRole('button', { name: /Confirmar/ }));
  return { user, onConfirm, onResend, box, confirm };
}

describe('EmailCodeForm', () => {
  it('foca o primeiro campo e avança ao digitar', async () => {
    const { user, box } = setup();
    expect(box(1)).toHaveFocus();
    await user.keyboard('12');
    expect(box(1)).toHaveValue('1');
    expect(box(2)).toHaveValue('2');
    expect(box(3)).toHaveFocus();
  });

  it('ignora o que não é dígito', async () => {
    const { user, box } = setup();
    await user.keyboard('a');
    expect(box(1)).toHaveValue('');
  });

  it('cola o código inteiro', async () => {
    const { user, box, onConfirm, confirm } = setup();
    await user.click(box(1));
    await user.paste('123 456');
    expect(box(6)).toHaveValue('6');
    await confirm();
    expect(onConfirm).toHaveBeenCalledWith('123456');
  });

  it('backspace em campo vazio apaga o anterior e volta', async () => {
    const { user, box } = setup();
    await user.keyboard('12');
    await user.keyboard('{Backspace}');
    expect(box(2)).toHaveValue('');
    expect(box(2)).toHaveFocus();
  });

  it('setas movem o foco', async () => {
    const { user, box } = setup();
    await user.keyboard('{ArrowRight}');
    expect(box(2)).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(box(1)).toHaveFocus();
  });

  it('exige os 6 dígitos, foca o primeiro vazio e não chama a API', async () => {
    const { user, box, onConfirm, confirm } = setup();
    await user.keyboard('123');
    await confirm();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Digite os 6 dígitos do código.',
    );
    expect(box(4)).toHaveFocus();
    expect(box(1)).toHaveAttribute('aria-describedby');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('mostra a mensagem do 400 e limpa os campos', async () => {
    const err = new AxiosError('x', 'ERR', undefined, undefined, {
      status: 400,
      data: { message: 'Código inválido' },
    } as never);
    const { user, box, confirm } = setup(vi.fn().mockRejectedValue(err));
    await user.keyboard('123456');
    await confirm();
    expect(await screen.findByText('Código inválido')).toBeInTheDocument();
    expect(box(1)).toHaveValue('');
    expect(box(1)).toHaveFocus();
  });

  it('erro de rede mostra mensagem genérica', async () => {
    const { user, confirm } = setup(vi.fn().mockRejectedValue(new Error('x')));
    await user.keyboard('123456');
    await confirm();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível verificar agora',
    );
  });

  it('reenviar mostra confirmação genérica e trava com cooldown', async () => {
    const { user, onResend } = setup();
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }));
    expect(onResend).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Se o e-mail existir, enviamos um novo código.',
    );
    expect(
      screen.getByRole('button', { name: /Reenviar em 60s/ }),
    ).toBeDisabled();
  });

  it('falha ao reenviar mostra erro e não inicia cooldown', async () => {
    const { user } = setup(undefined, vi.fn().mockRejectedValue(new Error()));
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível reenviar',
    );
    expect(
      screen.getByRole('button', { name: 'Reenviar código' }),
    ).toBeEnabled();
  });
});

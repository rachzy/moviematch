import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { LogoutModal } from './LogoutModal';

// O jsdom não implementa showModal/close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

function setup(open: boolean) {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  const view = render(
    <LogoutModal open={open} onCancel={onCancel} onConfirm={onConfirm} />,
  );
  return { onCancel, onConfirm, view };
}

describe('LogoutModal', () => {
  it('fica fechado e abre/fecha conforme `open`', () => {
    const { view, onCancel, onConfirm } = setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(
      <LogoutModal open onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(
      screen.getByRole('dialog', { name: 'Deseja sair da sua conta?' }),
    ).toBeInTheDocument();
    view.rerender(
      <LogoutModal open={false} onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Cancelar e Esc chamam onCancel, sem confirmar', async () => {
    const { onCancel, onConfirm } = setup(true);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent(
      screen.getByRole('dialog'),
      new Event('cancel', { cancelable: true }),
    );
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Sair chama onConfirm', async () => {
    const { onCancel, onConfirm } = setup(true);
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

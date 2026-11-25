import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getMe } from '../api';
import { UserMenu } from './UserMenu';

vi.mock('../api', () => ({ getMe: vi.fn() }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ logout: vi.fn() }) }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

describe('UserMenu', () => {
  it('mostra as iniciais e abre o menu com e-mail e Sair', async () => {
    vi.mocked(getMe).mockResolvedValue({
      id: '1',
      username: 'Ana Maria',
      email: 'ana@email.com',
    });
    render(<UserMenu />);
    const avatar = await screen.findByRole('button', { name: 'Menu da conta' });
    expect(await screen.findByText('AM')).toBeInTheDocument();

    await userEvent.click(avatar);
    expect(screen.getByText('ana@email.com')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(
      screen.getByRole('dialog', { name: 'Deseja sair da sua conta?' }),
    ).toBeInTheDocument();
  });
});

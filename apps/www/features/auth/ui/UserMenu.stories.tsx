import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { http } from '@/shared/lib/http';
import { AuthProvider } from './AuthContext';
import { UserMenu } from './UserMenu';

// GET /auth/me simulado: nenhuma chamada real à API.
function mockMe(Story: () => React.JSX.Element) {
  http.defaults.adapter = async (config) =>
    ({
      data: { id: '1', username: 'Ana Maria', email: 'ana@email.com' },
      status: 200,
      config,
    }) as never;
  return (
    <AuthProvider>
      <header className="topbar" style={{ justifyContent: 'flex-end' }}>
        <Story />
      </header>
    </AuthProvider>
  );
}

const meta = {
  title: 'Auth/UserMenu',
  component: UserMenu,
  decorators: [mockMe],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fechado: Story = {};

export const Aberto: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      await c.findByRole('button', { name: 'Menu da conta' }),
    );
    await expect(await c.findByText('ana@email.com')).toBeVisible();
    await expect(c.getByRole('menuitem', { name: 'Sair' })).toBeVisible();
  },
};

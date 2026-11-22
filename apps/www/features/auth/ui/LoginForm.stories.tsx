import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AuthProvider } from './AuthContext';
import { LoginForm } from './LoginForm';

const meta = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof LoginForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptySubmit: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Entrar' }),
    );
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'Preencha o e-mail e a senha.',
    );
  },
};

export const InvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('E-mail'), 'nao-e-email');
    await userEvent.type(c.getByLabelText('Senha'), '12345678');
    await userEvent.click(c.getByRole('button', { name: 'Entrar' }));
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Informe um e-mail válido.',
    );
  },
};

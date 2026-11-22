import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthCard, AuthLayout } from './AuthLayout';

const meta = {
  title: 'Auth/AuthLayout',
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

// Painel azul da marca + cartão; usado por login, cadastro e verificação.
export const Default: Story = {
  args: {
    children: (
      <AuthCard title="Criar conta">
        <p className="status-text">Conteúdo do cartão.</p>
      </AuthCard>
    ),
  },
};

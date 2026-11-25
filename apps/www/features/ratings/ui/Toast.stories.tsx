import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Toast } from './Toast';
import './ratings.css';

const meta = {
  title: 'Ratings/Toast',
  component: Toast,
  args: { onClose: fn() },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sucesso: Story = {
  args: {
    toast: {
      ok: true,
      title: 'Avaliação salva!',
      text: 'Sua nota e seu comentário já contam para seus matches.',
    },
  },
};
export const Erro: Story = {
  args: {
    toast: {
      ok: false,
      title: 'Não foi possível salvar',
      text: 'Verifique sua conexão e tente novamente.',
    },
  },
};

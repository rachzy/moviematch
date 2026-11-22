import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RegisterForm } from './RegisterForm';

const meta = {
  title: 'Auth/RegisterForm',
  component: RegisterForm,
} satisfies Meta<typeof RegisterForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Erros por campo; a dica de senha dá lugar à mensagem.
export const EmptySubmit: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Cadastrar' }));
    await expect(c.getByText('Informe seu e-mail.')).toBeInTheDocument();
    await expect(c.getByText('Informe um username.')).toBeInTheDocument();
    await expect(c.getByText('Crie uma senha.')).toBeInTheDocument();
  },
};

export const WeakPassword: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('E-mail'), 'ana@email.com');
    await userEvent.type(c.getByLabelText('Username'), 'ana');
    await userEvent.type(c.getByLabelText('Senha'), '1234');
    await userEvent.click(c.getByRole('button', { name: 'Cadastrar' }));
    await expect(c.getByLabelText('Senha')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

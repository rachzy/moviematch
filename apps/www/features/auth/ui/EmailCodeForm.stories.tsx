import { AxiosError } from 'axios';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmailCodeForm } from './EmailCodeForm';

const badRequest = (message: string) =>
  new AxiosError('x', 'ERR', undefined, undefined, {
    status: 400,
    data: { message },
  } as never);

const meta = {
  title: 'Auth/EmailCodeForm',
  component: EmailCodeForm,
  args: {
    email: 'ana@email.com',
    onConfirm: fn(async () => {}),
    onResend: fn(async () => {}),
  },
} satisfies Meta<typeof EmailCodeForm>;
export default meta;
type Story = StoryObj<typeof meta>;

async function typeCode(canvasElement: HTMLElement, code = '482913') {
  const c = within(canvasElement);
  await userEvent.click(c.getByLabelText('Dígito 1 de 6'));
  await userEvent.paste(code);
  await userEvent.click(c.getByRole('button', { name: 'Confirmar' }));
}

export const Default: Story = {};

export const Typing: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByLabelText('Dígito 1 de 6'),
    );
    await userEvent.paste('482');
  },
};

// onConfirm nunca resolve: fica no estado "Verificando…".
export const Verifying: Story = {
  args: { onConfirm: fn(() => new Promise<void>(() => {})) },
  play: ({ canvasElement }) => typeCode(canvasElement),
};

export const IncorrectCode: Story = {
  args: {
    onConfirm: fn(async () => {
      throw badRequest('Código incorreto ou expirado.');
    }),
  },
  play: async ({ canvasElement }) => {
    await typeCode(canvasElement);
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Código incorreto ou expirado.');
  },
};

export const TooManyAttempts: Story = {
  args: {
    onConfirm: fn(async () => {
      throw badRequest('Muitas tentativas. Solicite um novo código.');
    }),
  },
  play: async ({ canvasElement }) => {
    await typeCode(canvasElement);
    await expect(
      await within(canvasElement).findByText('Muitas tentativas'),
    ).toBeInTheDocument();
  },
};

export const Confirmed: Story = {
  play: async ({ canvasElement }) => {
    await typeCode(canvasElement);
    await expect(
      await within(canvasElement).findByText('Conta confirmada!'),
    ).toBeInTheDocument();
  },
};

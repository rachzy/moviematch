import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { http } from '@/shared/lib/http';
import { RateMovieModal } from './RateMovieModal';

const movie = {
  id: 2,
  title: 'A Última Estação',
  year: 2021,
  genre: 'Suspense',
  posterUrl: null,
};

// GET devolve a avaliação anterior (ou 404); PUT responde `put`.
function mock(get: { status: number; data?: unknown }, put = 200) {
  return (Story: () => React.JSX.Element) => {
    http.defaults.adapter = (config) =>
      new Promise((resolve, reject) => {
        const r =
          config.method === 'put'
            ? { status: put, data: { value: 5, comment: null, createdAt: '' } }
            : get;
        const response = { ...r, config } as never;
        const ok = r.status < 300 || config.validateStatus?.(r.status);
        ok ? resolve(response) : reject({ response, config });
      });
    return <Story />;
  };
}

const meta = {
  title: 'Ratings/RateMovieModal',
  component: RateMovieModal,
  args: { movie, onClose: fn() },
} satisfies Meta<typeof RateMovieModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NovaAvaliacao: Story = {
  decorators: [mock({ status: 404 })],
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement.ownerDocument.body);
    const send = c.getByRole('button', { name: 'Enviar avaliação' });
    await expect(send).toBeDisabled();
    await userEvent.click(c.getByLabelText('5 estrelas'));
    await userEvent.click(send);
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const JaAvaliado: Story = {
  decorators: [
    mock({
      status: 200,
      data: { value: 3, comment: 'Bom suspense', createdAt: '' },
    }),
  ],
};

export const ErroAoSalvar: Story = {
  decorators: [mock({ status: 404 }, 500)],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByLabelText('4 estrelas'));
    await userEvent.click(c.getByRole('button', { name: 'Enviar avaliação' }));
    await expect(
      await c.findByText(/Não foi possível salvar/),
    ).toBeInTheDocument();
  },
};

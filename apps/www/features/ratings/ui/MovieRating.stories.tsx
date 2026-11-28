import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { http } from '@/shared/lib/http';
import type { Rating } from '../types';
import { MovieRating } from './MovieRating';

const saved: Rating = {
  value: 4,
  comment: null,
  createdAt: '2026-11-20T12:00:00Z',
};

// Troca o adapter do axios: nenhuma chamada real à API.
type Reply = { status: number; data?: unknown; delay?: number };
function mock(get: Reply, put?: Reply) {
  return (Story: () => React.JSX.Element) => {
    http.defaults.adapter = (config) =>
      new Promise((resolve, reject) => {
        const r = config.method === 'put' ? (put ?? get) : get;
        const response = { data: r.data, status: r.status, config } as never;
        setTimeout(() => {
          const ok = r.status < 300 || config.validateStatus?.(r.status);
          ok ? resolve(response) : reject({ response, config });
        }, r.delay ?? 0);
      });
    return <Story />;
  };
}

const meta = {
  title: 'Ratings/MovieRating',
  component: MovieRating,
  args: { movieId: 1 },
} satisfies Meta<typeof MovieRating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [mock({ status: 200, data: saved, delay: 600000 })],
};

export const NotRated: Story = {
  decorators: [mock({ status: 404 })],
};

export const Rated: Story = {
  decorators: [mock({ status: 200, data: saved })],
};

export const Sending: Story = {
  decorators: [
    mock({ status: 404 }, { status: 200, data: saved, delay: 600000 }),
  ],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByLabelText('4 estrelas'));
    await userEvent.click(c.getByRole('button', { name: 'Enviar avaliação' }));
    await expect(c.getByText('Enviando…')).toBeInTheDocument();
  },
};

export const SaveErrorWithRetry: Story = {
  decorators: [mock({ status: 404 }, { status: 500 })],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByLabelText('4 estrelas'));
    await userEvent.click(c.getByRole('button', { name: 'Enviar avaliação' }));
    await expect(
      await c.findByRole('button', { name: 'Tentar novamente' }),
    ).toBeEnabled();
  },
};

export const LoadErrorWithRetry: Story = {
  decorators: [mock({ status: 500 })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Tentar novamente',
      }),
    ).toBeEnabled();
  },
};

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
const withComment: Rating = {
  ...saved,
  comment: 'Roteiro ótimo, mas o final podia ser mais curto.',
};

// Troca o adapter do axios: nenhuma chamada real à API.
type Reply = { status: number; data?: unknown; delay?: number };
function mock(get: Reply, put?: Reply, del?: Reply) {
  return (Story: () => React.JSX.Element) => {
    http.defaults.adapter = (config) =>
      new Promise((resolve, reject) => {
        const r =
          config.method === 'put'
            ? (put ?? get)
            : config.method === 'delete'
              ? (del ?? { status: 204 })
              : get;
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

export const RatedWithComment: Story = {
  decorators: [mock({ status: 200, data: withComment })],
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

export const SaveWithComment: Story = {
  decorators: [mock({ status: 404 }, { status: 200, data: withComment })],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByLabelText('4 estrelas'));
    await userEvent.type(
      c.getByLabelText('Comentário (opcional)'),
      'Roteiro ótimo',
    );
    await userEvent.click(c.getByRole('button', { name: 'Enviar avaliação' }));
    await expect(
      await c.findByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument();
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

export const EditOpen: Story = {
  decorators: [mock({ status: 200, data: withComment })],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Editar' }));
    await expect(
      c.getByRole('dialog', { name: 'Editar avaliação' }),
    ).toBeVisible();
  },
};

export const DeleteFlow: Story = {
  decorators: [mock({ status: 200, data: saved })],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Excluir' }));
    const dialog = c.getByRole('dialog', { name: 'Excluir avaliação?' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );
    await expect(
      await c.findByRole('button', { name: 'Enviar avaliação' }),
    ).toBeInTheDocument();
  },
};

export const DeleteError: Story = {
  decorators: [mock({ status: 200, data: saved }, undefined, { status: 500 })],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Excluir' }));
    const dialog = c.getByRole('dialog', { name: 'Excluir avaliação?' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );
    await expect(
      await within(dialog).findByText(
        'Não foi possível excluir. Tente novamente.',
      ),
    ).toBeInTheDocument();
  },
};

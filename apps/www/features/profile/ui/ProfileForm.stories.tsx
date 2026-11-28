import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { http } from '@/shared/lib/http';
import type { UserProfile } from '../types';
import { ProfileForm } from './ProfileForm';

const profile: UserProfile = {
  id: '1',
  email: 'ana@example.com',
  username: 'ana',
  nickname: 'Aninha',
  avatarUrl: null,
  pronouns: 'ela/dela',
};

// Troca o adapter do axios: nenhuma chamada real à API.
type Reply = { status: number; data?: unknown; delay?: number };
function mock(get: Reply, patch?: Reply) {
  return (Story: () => React.JSX.Element) => {
    http.defaults.adapter = (config) =>
      new Promise((resolve, reject) => {
        const r = config.method === 'patch' ? (patch ?? get) : get;
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
  title: 'Profile/ProfileForm',
  component: ProfileForm,
} satisfies Meta<typeof ProfileForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [mock({ status: 200, data: profile, delay: 600000 })],
};

export const Loaded: Story = {
  decorators: [mock({ status: 200, data: profile })],
};

export const LoadError: Story = {
  decorators: [mock({ status: 500 })],
};

export const SaveError: Story = {
  decorators: [
    mock(
      { status: 200, data: profile },
      {
        status: 400,
        data: [{ path: ['avatarUrl'], message: 'Informe uma URL válida' }],
      },
    ),
  ],
  play: async ({ canvasElement }) => {
    const save = await within(canvasElement).findByRole('button', {
      name: 'Salvar',
    });
    await userEvent.click(save);
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MailIcon, WarningIcon } from './icons';
import { AccountConfirmed, StatusPanel } from './StatusPanel';

const meta = {
  title: 'Auth/StatusPanel',
  component: StatusPanel,
} satisfies Meta<typeof StatusPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    icon: <MailIcon />,
    title: 'Confirmando seu e-mail...',
    text: 'Só um instante.',
  },
};

export const Warning: Story = {
  args: {
    icon: <WarningIcon />,
    title: 'Link inválido ou expirado',
    text: 'Não foi possível confirmar seu e-mail.',
  },
};

export const Confirmed: Story = {
  args: { icon: null, title: '' },
  render: () => <AccountConfirmed />,
};

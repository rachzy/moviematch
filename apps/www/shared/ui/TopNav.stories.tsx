import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TopNav } from './TopNav';

const meta = {
  title: 'Shared/TopNav',
  component: TopNav,
  decorators: [
    (Story) => (
      <header className="topbar">
        <Story />
      </header>
    ),
  ],
} satisfies Meta<typeof TopNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NaBusca: Story = {
  parameters: { nextjs: { navigation: { pathname: '/search' } } },
};
export const NoInicio: Story = {
  parameters: { nextjs: { navigation: { pathname: '/matches' } } },
};
export const NaPaginaDoFilme: Story = {
  parameters: { nextjs: { navigation: { pathname: '/movies/603' } } },
};

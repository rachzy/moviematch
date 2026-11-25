import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DeleteRatingModal } from './DeleteRatingModal';

const meta = {
  title: 'Ratings/DeleteRatingModal',
  component: DeleteRatingModal,
  args: { open: true, onCancel: fn(), onConfirm: fn() },
} satisfies Meta<typeof DeleteRatingModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Aberto: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole('button', { name: 'Excluir' }));
    await expect(args.onConfirm).toHaveBeenCalled();
  },
};

export const Excluindo: Story = { args: { deleting: true } };
export const Erro: Story = { args: { error: true } };

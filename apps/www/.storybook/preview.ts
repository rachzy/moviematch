import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { options: { app: { name: 'MovieMatch', value: '#0b1220' } } },
  },
  initialGlobals: { backgrounds: { value: 'app' } },
};

export default preview;

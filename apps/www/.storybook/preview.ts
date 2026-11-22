import type { Preview } from '@storybook/nextjs-vite';
// Mesma ordem do app/layout.tsx.
import '../shared/styles/base.css';
import '../shared/styles/card.css';
import '../shared/styles/form.css';
import '../shared/styles/button.css';
import '../app/globals.css';

// No app a fonte vem do next/font (app/layout.tsx); aqui definimos a variável usada em base.css.
document.documentElement.style.setProperty('--font-inter', "Inter, 'Segoe UI'");

const preview: Preview = {
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
    backgrounds: { options: { app: { name: 'MovieMatch', value: '#0b1220' } } },
  },
  initialGlobals: { backgrounds: { value: 'app' } },
};

export default preview;

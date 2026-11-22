import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: ['../{features,shared,stories}/**/*.stories.@(ts|tsx)'],
};

export default config;

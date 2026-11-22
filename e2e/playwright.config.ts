import { defineConfig } from '@playwright/test';

// Roda dentro do container `e2e` (veja docker/compose.e2e.yaml).
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 0,
  outputDir: '/tmp/test-results', // evita arquivos de root no bind mount
  reporter: 'list',
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://www:3000' },
});

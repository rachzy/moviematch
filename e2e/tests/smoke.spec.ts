import { expect, test } from '@playwright/test';

test('página de login carrega', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

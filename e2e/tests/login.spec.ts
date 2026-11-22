import { expect, test } from '@playwright/test';
import { getVerificationPath } from '../support/mailpit';
import { login, newUser, PASSWORD, register } from '../support/user';

test('cadastro, verificação por e-mail e login levam a /matches', async ({
  page,
}) => {
  const user = newUser();
  await register(page, user);
  await expect(page.locator('p.ok')).toBeVisible();

  await page.goto(await getVerificationPath(user.email));
  await page.getByRole('button', { name: 'Confirmar e-mail' }).click();
  await expect(page.locator('p.ok')).toHaveText(
    'E-mail verificado com sucesso!',
  );

  await login(page, user.email, PASSWORD);
  await expect(page).toHaveURL(/\/matches$/);
});

test('senha errada mostra erro', async ({ page }) => {
  const user = newUser();
  await register(page, user);
  await expect(page.locator('p.ok')).toBeVisible();
  await page.goto(await getVerificationPath(user.email));
  await page.getByRole('button', { name: 'Confirmar e-mail' }).click();
  await expect(page.locator('p.ok')).toBeVisible();

  await login(page, user.email, 'Outra@1234');
  await expect(page.locator('#login-error')).toHaveText(
    'E-mail ou senha inválidos',
  );
});

test('login sem verificar o e-mail é bloqueado', async ({ page }) => {
  const user = newUser();
  await register(page, user);
  await expect(page.locator('p.ok')).toBeVisible();

  await login(page, user.email, PASSWORD);
  await expect(page.locator('#login-error')).toHaveText(
    'Verifique seu e-mail antes de fazer login.',
  );
});

test('rota protegida sem login volta para /', async ({ page }) => {
  await page.goto('/matches');
  await expect(page).toHaveURL(/\/$/);
});

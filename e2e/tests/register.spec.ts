import { expect, test } from '@playwright/test';
import { getVerificationPath } from '../support/mailpit';
import { newUser, register } from '../support/user';

test('cadastro válido leva à tela de confirmação e envia o e-mail', async ({
  page,
}) => {
  const user = newUser();
  await register(page, user);
  await expect(page).toHaveURL(/\/register\/verify$/);
  expect(await getVerificationPath(user.email)).toContain('/verify-email');
});

test('e-mail duplicado é recusado', async ({ page }) => {
  const user = newUser();
  await register(page, user);
  await expect(page).toHaveURL(/\/register\/verify$/);
  await register(page, { ...user, username: `${user.username}x` });
  await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible();
});

test('senha curta é recusada', async ({ page }) => {
  await register(page, newUser(), 'abc');
  await expect(
    page.getByText('A senha deve ter no mínimo 8 caracteres.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});

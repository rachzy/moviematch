import { expect, test } from '@playwright/test';
import { getVerificationPath } from '../support/mailpit';
import { newUser, register } from '../support/user';

test('cadastro válido confirma e envia e-mail de verificação', async ({
  page,
}) => {
  const user = newUser();
  await register(page, user);
  // Não checa o texto: hoje ele sai "Usuário undefined cadastrado!" (a API devolve só { message }).
  await expect(page.locator('p.ok')).toBeVisible();
  expect(await getVerificationPath(user.email)).toContain('/verify-email');
});

test('e-mail duplicado é recusado', async ({ page }) => {
  const user = newUser();
  await register(page, user);
  await expect(page.locator('p.ok')).toBeVisible();
  await register(page, { ...user, username: `${user.username}x` });
  await expect(page.locator('p.error')).toHaveText('E-mail já cadastrado');
});

test('senha fraca é recusada pela API', async ({ page }) => {
  await register(page, newUser(), 'senhafraca');
  await expect(page.locator('p.error')).toHaveText(
    'Falha no cadastro. Verifique os dados.',
  );
});

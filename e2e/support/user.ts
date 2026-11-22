import { randomBytes } from 'crypto';
import { expect, type Page } from '@playwright/test';
import { getVerificationPath } from './mailpit';

export const PASSWORD = 'Senha@1234';

// Dados únicos por teste: o banco não é limpo entre testes.
export function newUser() {
  const id = randomBytes(4).toString('hex');
  return { email: `e2e-${id}@test.com`, username: `e2e_${id}` };
}

export async function register(
  page: Page,
  user: { email: string; username: string },
  password = PASSWORD,
) {
  await page.goto('/register');
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await page.getByLabel('Username', { exact: true }).fill(user.username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

// Registra e confirma o e-mail pelo link recebido no Mailpit.
export async function registerAndVerify(
  page: Page,
  user: { email: string; username: string },
) {
  await register(page, user);
  await page.waitForURL('**/register/verify');
  await page.goto(await getVerificationPath(user.email));
  await expect(page.getByText('Conta confirmada!')).toBeVisible();
}

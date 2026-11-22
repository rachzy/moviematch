import { randomBytes } from 'crypto';
import type { Page } from '@playwright/test';

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
  await page.getByPlaceholder('E-mail').fill(user.email);
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder(/^Senha/).fill(password);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

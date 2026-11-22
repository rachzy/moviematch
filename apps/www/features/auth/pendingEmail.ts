// E-mail do cadastro em andamento; fica no sessionStorage para não ir na URL.
const KEY = 'pendingEmail';

export function savePendingEmail(email: string) {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {}
}

export function readPendingEmail() {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function clearPendingEmail() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

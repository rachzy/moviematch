export type RegisterErrors = {
  email?: string;
  username?: string;
  password?: string;
};

// Espelha o registerSchema da API (apps/api/src/auth/auth.schemas.ts).
export function validateRegister(
  email: string,
  username: string,
  password: string,
) {
  const errors: RegisterErrors = {};

  if (!email) errors.email = 'Informe seu e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Digite um e-mail válido.';

  if (!username) errors.username = 'Informe um username.';
  else if (username.length < 3 || username.length > 30)
    errors.username = 'O username deve ter de 3 a 30 caracteres.';
  else if (!/^[a-zA-Z0-9_]+$/.test(username))
    errors.username = 'Use apenas letras, números e _';

  if (!password) errors.password = 'Crie uma senha.';
  else if (password.length < 8)
    errors.password = 'A senha deve ter no mínimo 8 caracteres.';
  else if (password.length > 72)
    errors.password = 'A senha deve ter no máximo 72 caracteres.';

  return errors;
}

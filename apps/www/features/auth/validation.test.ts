import { validateRegister } from './validation';

const ok = ['a@b.co', 'user_1', 'password1'] as const;

describe('validateRegister', () => {
  it('aceita dados válidos', () => {
    expect(validateRegister(...ok)).toEqual({});
  });

  it('exige todos os campos', () => {
    expect(validateRegister('', '', '')).toEqual({
      email: 'Informe seu e-mail.',
      username: 'Informe um username.',
      password: 'Crie uma senha.',
    });
  });

  it.each(['abc', 'a@b', 'a b@c.com', '@b.com'])(
    'rejeita e-mail inválido %s',
    (email) => {
      expect(validateRegister(email, ok[1], ok[2]).email).toBe(
        'Digite um e-mail válido.',
      );
    },
  );

  it('valida tamanho do username (3 a 30)', () => {
    const msg = 'O username deve ter de 3 a 30 caracteres.';
    expect(validateRegister(ok[0], 'ab', ok[2]).username).toBe(msg);
    expect(validateRegister(ok[0], 'a'.repeat(31), ok[2]).username).toBe(msg);
    expect(validateRegister(ok[0], 'abc', ok[2]).username).toBeUndefined();
    expect(
      validateRegister(ok[0], 'a'.repeat(30), ok[2]).username,
    ).toBeUndefined();
  });

  it('restringe os caracteres do username', () => {
    expect(validateRegister(ok[0], 'jo ao', ok[2]).username).toBe(
      'Use apenas letras, números e _',
    );
    expect(validateRegister(ok[0], 'joão', ok[2]).username).toBe(
      'Use apenas letras, números e _',
    );
  });

  it('valida tamanho da senha (8 a 72)', () => {
    expect(validateRegister(ok[0], ok[1], '1234567').password).toBe(
      'A senha deve ter no mínimo 8 caracteres.',
    );
    expect(validateRegister(ok[0], ok[1], 'a'.repeat(73)).password).toBe(
      'A senha deve ter no máximo 72 caracteres.',
    );
    expect(validateRegister(ok[0], ok[1], 'a'.repeat(72))).toEqual({});
  });
});

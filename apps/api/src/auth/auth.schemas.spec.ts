import {
  registerSchema,
  verifyCodeSchema,
  verifyEmailSchema,
} from './auth.schemas';

const valid = { email: 'A@a.com ', username: 'alice_1', password: 'Abcdef1!' };

describe('registerSchema', () => {
  it('aceita dados válidos e normaliza o e-mail', () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe('a@a.com');
  });

  it.each([
    ['curta', 'Ab1!'],
    ['sem maiúscula', 'abcdef1!'],
    ['sem minúscula', 'ABCDEF1!'],
    ['sem número', 'Abcdefg!'],
    ['sem caractere especial', 'Abcdefg1'],
    ['longa demais', 'Ab1!' + 'a'.repeat(70)],
  ])('rejeita senha %s', (_, password) => {
    expect(registerSchema.safeParse({ ...valid, password }).success).toBe(
      false,
    );
  });

  it('rejeita e-mail inválido', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'nao-e-email' });
    expect(result.success).toBe(false);
  });

  it.each(['ab', 'a'.repeat(31), 'com espaço', 'açúcar'])(
    'rejeita username %p',
    (username) => {
      expect(registerSchema.safeParse({ ...valid, username }).success).toBe(
        false,
      );
    },
  );
});

describe('verifyEmailSchema', () => {
  it('aceita token', () => {
    expect(verifyEmailSchema.safeParse({ token: 'abc' }).success).toBe(true);
  });

  it.each([{}, { token: '' }])('rejeita %p', (query) => {
    expect(verifyEmailSchema.safeParse(query).success).toBe(false);
  });
});

describe('verifyCodeSchema', () => {
  it('aceita e-mail e código de 6 dígitos', () => {
    expect(
      verifyCodeSchema.parse({ email: ' A@a.com', code: '012345' }),
    ).toEqual({ email: 'a@a.com', code: '012345' });
  });

  it.each(['12345', '1234567', 'abcdef', '12 456', 123456, undefined])(
    'rejeita código %p',
    (code) => {
      expect(
        verifyCodeSchema.safeParse({ email: 'a@a.com', code }).success,
      ).toBe(false);
    },
  );

  it('rejeita e-mail inválido', () => {
    expect(
      verifyCodeSchema.safeParse({ email: 'x', code: '123456' }).success,
    ).toBe(false);
  });
});

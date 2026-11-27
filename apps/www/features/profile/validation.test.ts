import { describe, expect, it } from 'vitest';
import { validateProfile } from './validation';

describe('validateProfile', () => {
  it('aceita valores válidos', () => {
    expect(
      validateProfile({
        nickname: 'Caua',
        avatarUrl: 'https://example.com/avatar.png',
        pronouns: 'ele/dele',
      }),
    ).toEqual({});
  });

  it('rejeita URL inválida e limites excedidos', () => {
    const result = validateProfile({
      nickname: 'a'.repeat(51),
      avatarUrl: 'ftp://invalido.com/img.png',
      pronouns: 'p'.repeat(41),
    });

    expect(result.nickname).toBeDefined();
    expect(result.avatarUrl).toBeDefined();
    expect(result.pronouns).toBeDefined();
  });
});
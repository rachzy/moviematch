export type ProfileFormValues = {
  nickname: string;
  avatarUrl: string;
  pronouns: string;
};

export type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>;

export function validateProfile(values: ProfileFormValues): ProfileErrors {
  const errors: ProfileErrors = {};

  if (values.nickname.trim().length > 50) {
    errors.nickname = 'O apelido deve ter no máximo 50 caracteres.';
  }

  const avatar = values.avatarUrl.trim();
  if (avatar && !/^https?:\/\/.+/i.test(avatar)) {
    errors.avatarUrl = 'Informe uma URL válida (http:// ou https://).';
  } else if (avatar.length > 500) {
    errors.avatarUrl = 'A URL da foto deve ter no máximo 500 caracteres.';
  }

  if (values.pronouns.trim().length > 40) {
    errors.pronouns = 'Os pronomes devem ter no máximo 40 caracteres.';
  }

  return errors;
}
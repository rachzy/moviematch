export type UserProfile = {
  id: string;
  email: string;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
  pronouns: string | null;
};

export type UpdateProfileInput = {
  nickname: string | null;
  avatarUrl: string | null;
  pronouns: string | null;
};
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { username: string };

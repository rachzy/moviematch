export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { username: string };
export type User = { id: string; email: string; username: string };

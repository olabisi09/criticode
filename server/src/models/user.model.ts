import type { User } from '@criticode/shared';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;

import type { JwtPayload } from 'jsonwebtoken';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export type Role = 'user' | 'admin';

export type User = {
  _id: string; // ObjectIds are handled as strings in API responses.
  name: string;
  email: string;
  password: string;
  roles: Role[];
  isActive?: boolean;
};

export type SafeUser = Omit<User, 'password'>;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayload = JwtPayload;

export type AccessTokenPayload = TokenPayload & {
  roles: Role[];
};

export type AuthResponse = {
  user: SafeUser;
  tokens: TokenPair;
};

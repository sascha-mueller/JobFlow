export type LogLevel = "INFO" | "WARN" | "ERROR";

export type User = {
  _id: string; // ObjectIds are handled as strings in API responses.
  email: string;
  password: string;
};

export type SafeUser = Omit<User, "password">;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: SafeUser;
  tokens: TokenPair;
};

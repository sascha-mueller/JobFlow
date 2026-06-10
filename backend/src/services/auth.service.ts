import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import {
  NODE_ENV,
  ACCESS_JWT_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_JWT_SECRET,
  REFRESH_TOKEN_TTL,
  SALT_ROUNDS,
} from "../config/index.ts";
import { User } from "../models/index.ts";
import { AppError } from "../utils/index.ts";

export const getCookieOpts = () =>
  ({
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  }) as const;

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => bcrypt.compare(password, hashedPassword);

export const createAccessToken = (id: string) => {
  return jwt.sign({}, ACCESS_JWT_SECRET, {
    subject: id,
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

export const createRefreshToken = (id: string) => {
  return jwt.sign({}, REFRESH_JWT_SECRET, {
    subject: id,
    expiresIn: REFRESH_TOKEN_TTL,
  });
};

export const verifyToken = <T>(token: string, secret: string) => {
  return jwt.verify(token, secret) as T;
};

export const getBearerToken = (authHeader?: string) => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(
      401,
      "Missing authentication header",
      "NO_AUTH_HEADER",
      "WARN",
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError(401, "Missing access token", "NO_TOKEN", "WARN");
  }

  return token;
};

export const parseAccessToken = (token: string) => {
  const payload = verifyToken<JwtPayload>(token, ACCESS_JWT_SECRET);

  if (!payload.sub) {
    throw new AppError(401, "Invalid token payload", "INVALID_TOKEN", "WARN");
  }

  return {
    id: payload.sub,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyToken<JwtPayload>(refreshToken, REFRESH_JWT_SECRET);

  if (!payload.sub) {
    throw new AppError(401, "Invalid token payload", "INVALID_TOKEN", "WARN");
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new AppError(
      404,
      `User: ${payload.sub} not found`,
      "NO_USER",
      "WARN",
    );
  }

  return createAccessToken(payload.sub);
};

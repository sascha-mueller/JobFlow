import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { User } from "../models/index.ts";
import { createUserSchema, loginSchema } from "@jobflow/shared";
import { AppError } from "../utils/index.ts";
import {
  getCookieOpts,
  hashPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "../services/index.ts";
import {
  assertUserExists,
  assertUserEmailAvailable,
} from "../services/index.ts";
import { REFRESH_JWT_SECRET, REFRESH_TOKEN_TTL } from "../config/index.ts";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const { password, ...userData } = data;

    await assertUserEmailAvailable(data.email);

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    const accessToken = createAccessToken(user.id);

    const refreshToken = createRefreshToken(user.id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      ...getCookieOpts(),
      expires: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError(
        401,
        `Invalid email or password`,
        "INVALID_CREDENTIALS",
        "WARN",
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
        "WARN",
      );
    }

    const accessToken = createAccessToken(user.id);

    const refreshToken = createRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      ...getCookieOpts(),
      expires: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    });

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      ...getCookieOpts(),
    });

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        401,
        "Missing refresh token",
        "NO_REFRESH_TOKEN",
        "WARN",
      );
    }

    const payLoad = verifyToken<JwtPayload>(refreshToken, REFRESH_JWT_SECRET);

    if (!payLoad.sub) {
      throw new AppError(
        401,
        "Missing refresh token",
        "NO_REFRESH_TOKEN",
        "WARN",
      );
    }

    const user = await assertUserExists(payLoad.sub);

    const accessToken = createAccessToken(user.id);

    res.cookie("accessToken", accessToken, getCookieOpts());

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
    });
  } catch (error: unknown) {
    next(error);
  }
};

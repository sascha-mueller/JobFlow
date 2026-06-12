import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { AppError } from "../utils/index.ts";
import {
  assertUserExists,
  getCookieOpts,
  verifyToken,
} from "../services/index.ts";
import { REFRESH_JWT_SECRET } from "../config/index.ts";

export const getUser: RequestHandler = async (req, res, next) => {
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

    if (user.refreshToken !== refreshToken) {
      throw new AppError(
        401,
        "Invalid refresh token",
        "INVALID_REFRESH_TOKEN",
        "WARN",
      );
    }

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
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

    if (user.refreshToken !== refreshToken) {
      throw new AppError(
        401,
        "Invalid refresh token",
        "INVALID_REFRESH_TOKEN",
        "WARN",
      );
    }

    await user.deleteOne();

    res.clearCookie("refreshToken", getCookieOpts());
    res.sendStatus(204);
  } catch (error: unknown) {
    next(error);
  }
};

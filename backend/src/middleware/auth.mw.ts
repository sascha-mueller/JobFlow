import type { RequestHandler } from "express";

import { AppError } from "../utils/index.ts";
import { parseAccessToken } from "../services/index.ts";

export const authToken: RequestHandler = (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(401, "Missing access token", "NO_TOKEN", "WARN");
    }

    req.user = parseAccessToken(token);

    next();
  } catch (error) {
    next(error);
  }
};

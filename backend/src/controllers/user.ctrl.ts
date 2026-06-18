import type { RequestHandler } from "express";

import { assertUserExists, getCookieOpts } from "../services/index.ts";

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await assertUserExists(req.user!.id);

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
    const user = await assertUserExists(req.user!.id);

    await user.deleteOne();

    res.clearCookie("refreshToken", getCookieOpts());
    res.sendStatus(204);
  } catch (error: unknown) {
    next(error);
  }
};

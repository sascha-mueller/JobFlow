import type { RequestHandler } from "express";
import { type ZodType } from "zod";
import { AppError } from "../utils/index.ts";

// String Literal Union Types
type ValidationSource = "body" | "params" | "query";

export const validate =
  (schema: ZodType, source: ValidationSource = "body"): RequestHandler =>
  (req, _res, next) => {
    const { success, data, error } = schema.safeParse(req[source]);

    if (!success) {
      const issue = error.issues[0];

      throw new AppError(
        400,
        issue?.message ?? "Validation failed",
        "VALIDATION_ERROR",
        "WARN",
      );
    }

    req[source] = data;

    next();
  };

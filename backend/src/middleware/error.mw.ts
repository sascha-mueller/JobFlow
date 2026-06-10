import type { ErrorRequestHandler } from "express";

import { AppError, writeLog } from "../utils/index.ts";

export const baseErrHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const errorType = err instanceof Error ? err.name : "UnknownError";
  const message = err instanceof Error ? err.message : String(err);

  res.status(500).json({
    method: req.method,
    path: req.originalUrl,
    errorType,
    statusCode: 500,
    message,
    errorCode: "INTERNAL_ERROR",
  });
};

export const extErrHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    next(err);
    return;
  }

  writeLog(
    err.logLevel,
    `${req.method} | ${req.originalUrl} | AppError | ${err.statusCode} | ${err.message} | ${err.errorCode}`,
  );

  res.status(err.statusCode).json({
    method: req.method,
    path: req.originalUrl,
    errorType: "AppError",
    statusCode: err.statusCode,
    message: err.message,
    errorCode: err.errorCode,
    stack:
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.stack?.split("\n").map((line) => line.trim())
        : undefined,
  });
};

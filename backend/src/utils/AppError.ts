import { LOG_LEVEL } from '../config/index.ts';
import type { LogLevel } from '../types/index.ts';

export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  logLevel: LogLevel = LOG_LEVEL;

  constructor(
    statusCode: number,
    message: string,
    errorCode = 'APP_ERROR',
    logLevel: LogLevel = LOG_LEVEL,
  ) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.logLevel = logLevel;

    Error.captureStackTrace(this, this.constructor);
  }
}

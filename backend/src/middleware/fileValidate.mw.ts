import type { RequestHandler } from "express";
import { fileTypeFromBuffer } from "file-type";

import { FILE_TYPE } from "../config/index.ts";
import { AppError } from "../utils/index.ts";

export const fileValidate =
  (mode: "create" | "update"): RequestHandler =>
  async (req, _res, next) => {
    try {
      if (!req.file) {
        if (mode === "create") {
          throw new AppError(
            400,
            "No file uploaded",
            "NO_FILE_UPLOADED",
            "WARN",
          );
        }

        return next();
      }

      const meta = await fileTypeFromBuffer(req.file.buffer);

      if (!meta) {
        throw new AppError(
          415,
          "Unable to detect file type",
          "UNKNOWN_FILE_TYPE",
          "WARN",
        );
      }

      const ext = meta.ext.toUpperCase();

      if (!FILE_TYPE.includes(ext)) {
        throw new AppError(
          415,
          `File type ${ext} is not allowed`,
          "UNSUPPORTED_MEDIA_TYPE",
          "WARN",
        );
      }

      req.fileMeta = meta;

      next();
    } catch (error) {
      next(error);
    }
  };

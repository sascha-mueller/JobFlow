import fs from "node:fs/promises";
import path from "node:path";
import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

import { NODE_ENV } from "../config/index.ts";
import { AppError } from "../utils/index.ts";

export const fileStore: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.file || !req.fileMeta) {
      return next();
    }

    if (NODE_ENV === "production") {
      throw new AppError(
        501,
        "Cloudinary upload not implemented yet",
        "NOT_IMPLEMENTED",
        "WARN",
      );
    } else {
      const uploadDir = path.join(process.cwd(), "files");

      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${randomUUID()}.${req.fileMeta.ext}`;

      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, req.file.buffer);

      req.body.filename = filename;
      req.body.originalFileName = req.file.originalname;
      req.body.mimetype = req.fileMeta.mime;
      req.body.size = req.file.size;
      req.body.path = filePath;
    }

    next();
  } catch (error) {
    next(error);
  }
};

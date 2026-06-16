import fs from "node:fs/promises";
import path from "node:path";
import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

import {
  NODE_ENV,
  CLOUDINARY_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET,
} from "../config/index.ts";
import { AppError } from "../utils/index.ts";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, folder = "JobFlow") =>
  new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(
              500,
              "Upload to Cloudinary failed",
              "UPLOAD_ERROR",
              "ERROR",
            ),
          );
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      },
    );

    Readable.from(buffer).pipe(cloudinaryStream);
  });

export const fileStore: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file || !req.fileMeta) {
      return next();
    }

    if (NODE_ENV === "production") {
      const result = await uploadToCloudinary(req.file.buffer);

      req.body.filename = result.public_id;
      req.body.path = result.secure_url;
    } else {
      const uploadDir = path.join(process.cwd(), "files");
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${randomUUID()}.${req.fileMeta.ext}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, req.file.buffer);

      req.body.filename = filename;
      req.body.path = filePath;
    }

    req.body.originalFileName = req.file.originalname;
    req.body.mimetype = req.fileMeta.mime;
    req.body.size = req.file.size;

    next();
  } catch (error) {
    next(error);
  }
};

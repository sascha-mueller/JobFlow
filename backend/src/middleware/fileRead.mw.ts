import multer from "multer";

import { FILE_SIZE } from "../config/index.ts";

export const fileRead = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_SIZE,
  },
}).single("file");

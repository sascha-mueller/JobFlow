import type { FileTypeResult } from "file-type";
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      fileMeta?: FileTypeResult;
    }
  }
}

export {};

import type { Role } from "./index.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: Role[];
      };
    }
  }
}

export {};

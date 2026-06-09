import { z } from "zod";

export const DocumentType = z.enum([
  "CV",
  "COVER_LETTER",
  "CERTIFICATE",
  "PHOTO",
  "OTHER",
]);

export type DocumentType = z.infer<typeof DocumentType>;

import { z } from "zod";
import { DocumentType } from "../constants/document.constants.ts";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createDocumentSchema = z.object({
  type: DocumentType,
  application: objectIdSchema.optional(),
  filename: z.string().min(3),
  originalFileName: z.string().min(3),
  mimetype: z.string().min(3),
  size: z.number().positive(),
  path: z.string().min(3),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const documentIdParamsSchema = z.object({
  id: objectIdSchema,
});

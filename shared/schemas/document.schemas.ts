import { z } from "zod";
import { DocumentType } from "../constants/document.constants";

export const createDocumentSchema = z.object({
  type: DocumentType,
  application: z.string().optional(), // MongoDB ObjectId als String vom Client
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

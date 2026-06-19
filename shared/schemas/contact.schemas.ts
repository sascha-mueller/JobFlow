import { z } from "zod";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  company: z.string().optional(), // MongoDB ObjectId als String vom Client
  position: z.string().optional(),
  linkedIn: z
    .string()
    .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
    .pipe(z.url())
    .optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const contactIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type Contact = CreateContactInput & {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
};

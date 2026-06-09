import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(), // MongoDB ObjectId als String vom Client
  linkedIn: z.url().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

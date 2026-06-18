import { z } from "zod";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createCompanySchema = z.object({
  name: z.string().min(3),
  street: z.string().min(5),
  city: z.string().min(3),
  zip: z.string().min(3),
  website: z.string()
    .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
    .pipe(z.url())
    .optional(),
  notes: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const companyIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type Company = CreateCompanyInput & {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
};

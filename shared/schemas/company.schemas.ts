import { z } from "zod";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createCompanySchema = z.object({
  name: z.string().min(3),
  street: z.string().min(5),
  city: z.string().min(3),
  zip: z.string().min(3),
  website: z.string()
    .transform((v) => (v.trim() === "" ? undefined : /^https?:\/\//i.test(v) ? v : `https://${v}`))
    .pipe(z.url().optional())
    .optional(),
  contact: z.string().optional(), // MongoDB ObjectId als String vom Client
  notes: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const companyIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type CompanyContact = {
  _id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
};

export type Company = Omit<CreateCompanyInput, "contact"> & {
  _id: string;
  user: string;
  contact?: CompanyContact;
  createdAt: string;
  updatedAt: string;
};

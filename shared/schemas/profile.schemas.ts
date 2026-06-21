import { z } from "zod";
import { Salutation } from "../constants/profile.constants.ts";

export const createProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  salutation: Salutation.optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  photo: z.string().optional(), // MongoDB ObjectId als String vom Client
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type Profile = CreateProfileInput & {
  _id: string;
  user: string;
};

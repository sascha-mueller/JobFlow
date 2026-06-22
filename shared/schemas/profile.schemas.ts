import { z } from "zod";
import { Salutation } from "../constants/profile.constants.ts";

const languageSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1),
});

const profileLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

export const createProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  salutation: Salutation.optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  photo: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  desiredSalary: z.string().optional(),
  availability: z.string().optional(),
  workModel: z.string().optional(),
  languages: z.array(languageSchema).optional(),
  links: z.array(profileLinkSchema).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export type Language = z.infer<typeof languageSchema>;
export type ProfileLink = z.infer<typeof profileLinkSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type Profile = CreateProfileInput & {
  _id: string;
  user: string;
};

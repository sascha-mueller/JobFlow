import { z } from "zod";
import {
  ApplicationStatus,
  WorkMode,
} from "../constants/application.constants.ts";

export const createApplicationSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  link: z.url().optional(),
  status: ApplicationStatus,
  company: z.string().optional(), // MongoDB ObjectId als String vom Client
  contact: z.string().optional(), // MongoDB ObjectId als String vom Client
  workLocation: z.string().optional(),
  workMode: WorkMode.optional(),
  appliedAt: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

import { z } from "zod";
import {
  ApplicationStatus,
  WorkMode,
} from "../constants/application.constants.ts";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createApplicationSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  link: z.url().optional(),
  isFavorite: z.boolean().default(false),
  status: ApplicationStatus,
  company: z.string().optional(), // MongoDB ObjectId als String vom Client
  contact: z.string().optional(), // MongoDB ObjectId als String vom Client
  workLocation: z.string().optional(),
  workMode: WorkMode.optional(),
  appliedAt: z.string().optional(),
  deadline: z.string().optional(),
  followUpAt: z.string().optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const applicationIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type PopulatedCompany = { _id: string; name: string };

export type PopulatedContact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  linkedIn?: string;
};

export type StatusHistoryEntry = {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
};

export type Application = Omit<
  CreateApplicationInput,
  "company" | "contact"
> & {
  _id: string;
  user: string;
  company?: PopulatedCompany;
  contact?: PopulatedContact;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

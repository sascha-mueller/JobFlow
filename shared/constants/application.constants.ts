import { z } from "zod";

export const ApplicationStatus = z.enum([
  "WATCHLIST",
  "DRAFT",
  "SENT",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
]);

export const WorkMode = z.enum(["REMOTE", "HYBRID", "ONSITE"]);

export type ApplicationStatus = z.infer<typeof ApplicationStatus>;
export type WorkMode = z.infer<typeof WorkMode>;

import { z } from "zod";

export const Salutation = z.enum(["MR", "MS", "DIVERSE"]);

export type Salutation = z.infer<typeof Salutation>;

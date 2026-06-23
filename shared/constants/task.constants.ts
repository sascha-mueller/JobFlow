import { z } from "zod";

export const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export type TaskStatus = z.infer<typeof TaskStatus>;

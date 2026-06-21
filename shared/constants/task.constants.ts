import { z } from "zod";

export const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

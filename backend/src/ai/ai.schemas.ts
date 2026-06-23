import { z } from "zod";

import { objectIdSchema } from "@jobflow/shared";

export const appIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const generatedTaskSchema = z.object({
  title: z.string().min(3).trim(),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(5),
});

export const returnedErrorSchema = z.object({
  message: z.string(),
  errorCode: z.enum([
    "INSUFFICIENT_CONTEXT",
    "NO_ACTION_REQUIRED",
    "TASK_EXISTS",
  ]),
});

export type AppIdParams = z.infer<typeof appIdParamsSchema>;

export type GeneratedTask = z.infer<typeof generatedTaskSchema>;

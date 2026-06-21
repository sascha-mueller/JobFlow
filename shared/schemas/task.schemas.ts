import { z } from "zod";
import { TaskStatus } from "../constants/task.constants.ts";
import { objectIdSchema } from "./common/objectId.schema.ts";

export const createTaskSchema = z.object({
  title: z.string().min(3).trim(),
  description: z.string().optional(),
  status: TaskStatus,
  application: objectIdSchema,
  priority: z.number().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskIdParamsSchema = z.object({
  id: objectIdSchema,
});

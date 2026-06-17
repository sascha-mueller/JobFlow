import { z } from "zod";

/**
 * MongoDB ObjectId string validator.
 *
 * API requests usually carry ObjectId values as strings.
 * Mongoose can convert the validated string to Types.ObjectId later.
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export type ObjectIdInput = z.infer<typeof objectIdSchema>;

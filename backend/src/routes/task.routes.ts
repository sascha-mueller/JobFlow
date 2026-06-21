import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  taskIdParamsSchema,
  createTaskSchema,
  updateTaskSchema,
} from "@jobflow/shared";

const taskRouter = Router();

taskRouter.use(authToken);

taskRouter
  .route("/")
  .get(getTasks)
  .post(validate(createTaskSchema), createTask);

taskRouter
  .route("/:id")
  .get(validate(taskIdParamsSchema, "params"), getTaskById)
  .patch(
    validate(taskIdParamsSchema, "params"),
    validate(updateTaskSchema),
    updateTask,
  )
  .delete(validate(taskIdParamsSchema, "params"), deleteTask);

export default taskRouter;

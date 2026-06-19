import { Router } from "express";

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  updateApplication,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  applicationIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
} from "@jobflow/shared";

const applicationRouter = Router();

applicationRouter.use(authToken);

applicationRouter
  .route("/")
  .get(getApplications)
  .post(validate(createApplicationSchema), createApplication);

applicationRouter
  .route("/:id")
  .get(validate(applicationIdParamsSchema, "params"), getApplicationById)
  .patch(
    validate(applicationIdParamsSchema, "params"),
    validate(updateApplicationSchema),
    updateApplication,
  )
  .delete(validate(applicationIdParamsSchema, "params"), deleteApplication);

export default applicationRouter;

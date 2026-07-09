import { Router } from "express";

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  updateApplication,
  updateStatusHistoryEntry,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  applicationHistoryParamsSchema,
  applicationIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusHistoryEntrySchema,
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

applicationRouter
  .route("/:id/history/:historyId")
  .patch(
    validate(applicationHistoryParamsSchema, "params"),
    validate(updateStatusHistoryEntrySchema),
    updateStatusHistoryEntry,
  );

export default applicationRouter;

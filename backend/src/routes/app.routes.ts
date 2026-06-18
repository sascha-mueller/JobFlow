import { Router } from "express";

import {
  createApp,
  deleteApp,
  getAppById,
  getApps,
  updateApp,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  appIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
} from "@jobflow/shared";

const appRouter = Router();

appRouter.use(authToken);

appRouter
  .route("/")
  .get(getApps)
  .post(validate(createApplicationSchema), createApp);

appRouter
  .route("/:id")
  .get(validate(appIdParamsSchema, "params"), getAppById)
  .patch(
    validate(appIdParamsSchema, "params"),
    validate(updateApplicationSchema),
    updateApp,
  )
  .delete(validate(appIdParamsSchema, "params"), deleteApp);

export default appRouter;

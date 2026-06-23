import { Router } from "express";

import { createFollowUpSuggestion } from "./ai.ctrl.ts";

import { authToken, validate } from "../middleware/index.ts";
import { appIdParamsSchema } from "@jobflow/shared";

const aiRouter = Router();

aiRouter.use(authToken);

aiRouter
  .route("/applications/:id/follow-up-suggestion")
  .post(validate(appIdParamsSchema, "params"), createFollowUpSuggestion);

export default aiRouter;

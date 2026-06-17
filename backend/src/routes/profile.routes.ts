import { Router } from "express";

import {
  createProfile,
  deleteProfile,
  getProfileByUserId,
  updateProfile,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import { createProfileSchema, updateProfileSchema } from "@jobflow/shared";

const profileRouter = Router();

profileRouter.use(authToken);

profileRouter.route("/").post(validate(createProfileSchema), createProfile);

profileRouter
  .route("/me")
  .get(getProfileByUserId)
  .patch(validate(updateProfileSchema), updateProfile)
  .delete(deleteProfile);

export default profileRouter;

import { Router } from "express";

import { deleteUser, getUser } from "../controllers/index.ts";
import { authToken } from "../middleware/index.ts";

const userRouter = Router();

userRouter.use(authToken);

userRouter.route("/me").get(getUser).delete(deleteUser);

export default userRouter;

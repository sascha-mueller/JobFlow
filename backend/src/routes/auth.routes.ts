import { Router } from "express";

import { createUserSchema, loginSchema } from "@jobflow/shared";
import { validate } from "../middleware/index.ts";
import { register, login, logout, refresh } from "../controllers/index.ts";

const authRouter = Router();

authRouter.post("/register", validate(createUserSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refresh);

export default authRouter;

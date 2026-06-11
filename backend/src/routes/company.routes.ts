import { Router } from "express";

import {
  createCompany,
  deleteCompany,
  getCompanyById,
  getCompanies,
  updateCompany,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  companyIdParamsSchema,
  createCompanySchema,
  updateCompanySchema,
} from "@jobflow/shared";

const companyRouter = Router();

companyRouter.use(authToken);

companyRouter
  .route("/")
  .get(getCompanies)
  .post(validate(createCompanySchema), createCompany);

companyRouter
  .route("/:id")
  .get(validate(companyIdParamsSchema, "params"), getCompanyById)
  .patch(
    validate(companyIdParamsSchema, "params"),
    validate(updateCompanySchema),
    updateCompany,
  )
  .delete(validate(companyIdParamsSchema, "params"), deleteCompany);

export default companyRouter;

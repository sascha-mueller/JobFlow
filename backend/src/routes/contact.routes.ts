import { Router } from "express";

import {
  createContact,
  deleteContact,
  getContactById,
  getContacts,
  updateContact,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  contactIdParamsSchema,
  createContactSchema,
  updateContactSchema,
} from "@jobflow/shared";

const contactRouter = Router();

contactRouter.use(authToken);

contactRouter
  .route("/")
  .get(getContacts)
  .post(validate(createContactSchema), createContact);

contactRouter
  .route("/:id")
  .get(validate(contactIdParamsSchema, "params"), getContactById)
  .patch(
    validate(contactIdParamsSchema, "params"),
    validate(updateContactSchema),
    updateContact,
  )
  .delete(validate(contactIdParamsSchema, "params"), deleteContact);

export default contactRouter;

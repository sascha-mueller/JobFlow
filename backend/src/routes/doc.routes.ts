import { Router } from "express";

import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../controllers/index.ts";
import { authToken, validate } from "../middleware/index.ts";
import {
  documentIdParamsSchema,
  createDocumentSchema,
  updateDocumentSchema,
} from "@jobflow/shared";

const docRouter = Router();

docRouter.use(authToken);

docRouter
  .route("/")
  .get(getDocuments)
  .post(validate(createDocumentSchema), createDocument);

docRouter
  .route("/:id")
  .get(validate(documentIdParamsSchema, "params"), getDocumentById)
  .patch(
    validate(documentIdParamsSchema, "params"),
    validate(updateDocumentSchema),
    updateDocument,
  )
  .delete(validate(documentIdParamsSchema, "params"), deleteDocument);

export default docRouter;

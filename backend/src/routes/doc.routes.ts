import { Router } from "express";

import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../controllers/index.ts";
import {
  authToken,
  validate,
  fileRead,
  fileValidate,
  fileStore,
} from "../middleware/index.ts";
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
  .post(
    fileRead,
    fileValidate("create"),
    fileStore,
    validate(createDocumentSchema),
    createDocument,
  );

docRouter
  .route("/:id")
  .get(validate(documentIdParamsSchema, "params"), getDocumentById)
  .patch(
    validate(documentIdParamsSchema, "params"),
    fileRead,
    fileValidate("update"),
    fileStore,
    validate(updateDocumentSchema),
    updateDocument,
  )
  .delete(validate(documentIdParamsSchema, "params"), deleteDocument);

export default docRouter;

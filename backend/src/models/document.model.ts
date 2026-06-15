import { Schema, model, Types } from "mongoose";
import { DocumentType } from "@jobflow/shared";
import type { CreateDocumentInput } from "@jobflow/shared";

// cSpell:disable-next-line
// Multer-Felder existieren nicht im Zod-Schema — die kommen beim Upload dazu
type DocDocument = Omit<CreateDocumentInput, "application"> & {
  user: Types.ObjectId;
  application?: Types.ObjectId;
};

const documentSchema = new Schema<DocDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: DocumentType.options, required: true },
    application: { type: Schema.Types.ObjectId, ref: "Application" },
    filename: { type: String, required: true },
    originalFileName: { type: String, required: true },
    mimetype: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);
// cSpell:disable-next-line
// "Document" als Variablenname würde den globalen Node.js-Typ shadowing — daher DocumentModel
documentSchema.index({ user: 1 });
documentSchema.index({ user: 1, application: 1 });

export const DocumentModel = model<DocDocument>("Document", documentSchema);

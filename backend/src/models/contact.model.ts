import { Schema, model, Types } from "mongoose";
import type { CreateContactInput } from "@jobflow/shared";

// company kommt vom Client als string (ObjectId), in der DB ist es Types.ObjectId
type ContactDocument = Omit<CreateContactInput, "company"> & {
  user: Types.ObjectId;
  company?: Types.ObjectId;
};

const contactSchema = new Schema<ContactDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    linkedIn: String,
  },
  { timestamps: true },
);

contactSchema.index({ user: 1 });
contactSchema.index({ user: 1, company: 1 });
contactSchema.index({ user: 1, email: 1 }, { unique: true });

export const Contact = model<ContactDocument>("Contact", contactSchema);

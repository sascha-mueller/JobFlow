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
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    linkedIn: String,
  },
  { timestamps: true }
);

export const Contact = model<ContactDocument>("Contact", contactSchema);

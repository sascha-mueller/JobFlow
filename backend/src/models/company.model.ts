import { Schema, model, Types } from "mongoose";
import type { CreateCompanyInput } from "@jobflow/shared";

type CompanyDocument = CreateCompanyInput & {
  user: Types.ObjectId;
};

const companySchema = new Schema<CompanyDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    website: String,
    notes: String,
  },
  { timestamps: true }
);

companySchema.index({ user: 1 });

export const Company = model<CompanyDocument>("Company", companySchema);

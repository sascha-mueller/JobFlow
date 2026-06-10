import { Schema, model, Types } from "mongoose";
import { ApplicationStatus, WorkMode } from "@jobflow/shared";
import type { CreateApplicationInput } from "@jobflow/shared";

// company/contact: string im Zod-Type → ObjectId in der DB
// Datumsfelder: ISO-String vom Client → Date in der DB
type ApplicationDocument = Omit<
  CreateApplicationInput,
  "company" | "contact" | "appliedAt" | "deadline" | "followUpAt"
> & {
  user: Types.ObjectId;
  company?: Types.ObjectId;
  contact?: Types.ObjectId;
  appliedAt?: Date;
  deadline?: Date;
  followUpAt?: Date;
};

const applicationSchema = new Schema<ApplicationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    salaryMin: Number,
    salaryMax: Number,
    link: String,
    isFavorite: { type: Boolean, default: false },
    // .options liefert das string-Array des Zod-Enums — keine manuelle Dopplung
    status: { type: String, enum: ApplicationStatus.options, required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    contact: { type: Schema.Types.ObjectId, ref: "Contact" },
    workLocation: String,
    workMode: { type: String, enum: WorkMode.options },
    appliedAt: Date,
    deadline: Date,
    followUpAt: Date,
    notes: String,
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, isFavorite: 1 });
applicationSchema.index({ user: 1, followUpAt: 1 });

export const Application = model<ApplicationDocument>(
  "Application",
  applicationSchema
);

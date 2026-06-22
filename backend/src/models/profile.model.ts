import { Schema, model, Types } from "mongoose";
import { Salutation } from "@jobflow/shared";
import type { CreateProfileInput } from "@jobflow/shared";

type ProfileDocument = Omit<CreateProfileInput, "photo"> & {
  user: Types.ObjectId;
  photo?: Types.ObjectId;
};

const profileSchema = new Schema<ProfileDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    salutation: { type: String, enum: Salutation.options },
    headline: String,
    summary: String,
    skills: [String],
    photo: { type: Schema.Types.ObjectId, ref: "Document" },
    email: String,
    phone: String,
    city: String,
    country: String,
    yearsExperience: Number,
    desiredSalary: String,
    availability: String,
    workModel: String,
    languages: [{ name: String, level: String }],
    links: [{ label: String, url: String }],
  },
  { timestamps: true },
);

export const Profile = model<ProfileDocument>("Profile", profileSchema);

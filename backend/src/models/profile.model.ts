import { Schema, model, Types } from "mongoose";
import { Salutation } from "@jobflow/shared";
import type { CreateProfileInput } from "@jobflow/shared";

// cSpell:disable-next-line
// photo kommt vom Client als string (ObjectId), in der DB ist es Types.ObjectId
type ProfileDocument = Omit<CreateProfileInput, "photo"> & {
  user: Types.ObjectId;
  photo?: Types.ObjectId;
};

const profileSchema = new Schema<ProfileDocument>(
  {
    // cSpell:disable-next-line
    // unique: true erzwingt die 1:1-Beziehung auf DB-Ebene
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
  },
  { timestamps: true },
);

export const Profile = model<ProfileDocument>("Profile", profileSchema);

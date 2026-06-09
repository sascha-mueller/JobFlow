import { Schema, model } from "mongoose";
import type { CreateUserInput } from "@jobflow/shared";

// refreshTokens existiert nur in der DB — der Client kennt dieses Feld nicht
type UserDocument = CreateUserInput & {
  refreshTokens: string[];
};

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);

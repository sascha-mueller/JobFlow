import { User } from "../models/index.ts";
import { AppError } from "../utils/index.ts";

export const assertUserExists = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, `User: ${userId} not found`, "NO_USER", "WARN");
  }

  return user;
};

export const assertUserEmailAvailable = async (
  email: string,
  excludeId?: string,
) => {
  const found = await User.findOne({
    email,
    ...(excludeId && {
      _id: { $ne: excludeId },
    }),
  });

  if (found) {
    throw new AppError(
      400,
      `Email: ${email} already exists`,
      "EXISTED_EMAIL",
      "WARN",
    );
  }
};

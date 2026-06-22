import type { Profile, UpdateProfileInput } from "@jobflow/shared";
import { api } from "./api";

export const profileApi = {
  getMe: () => api.get<Profile>("/profiles/me"),
  update: (data: UpdateProfileInput) => api.patch<Profile>("/profiles/me", data),
};

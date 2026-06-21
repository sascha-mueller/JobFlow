import type { Profile } from "@jobflow/shared";
import { api } from "./api";

export const profileApi = {
  getMe: () => api.get<Profile>("/profiles/me"),
};

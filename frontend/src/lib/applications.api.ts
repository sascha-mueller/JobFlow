import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@jobflow/shared";
import { api } from "./api";

export const applicationsApi = {
  getAll: () => api.get<Application[]>("/applications"),
  getById: (id: string) => api.get<Application>(`/applications/${id}`),
  create: (data: CreateApplicationInput) =>
    api.post<Application>("/applications", data),
  update: (id: string, data: UpdateApplicationInput) =>
    api.patch<Application>(`/applications/${id}`, data),
  updateHistoryEntry: (appId: string, historyId: string, changedAt: string) =>
    api.patch<Application>(`/applications/${appId}/history/${historyId}`, {
      changedAt,
    }),
  remove: (id: string) => api.delete<void>(`/applications/${id}`),
};

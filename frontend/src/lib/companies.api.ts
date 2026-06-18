import type { Company, CreateCompanyInput, UpdateCompanyInput } from "@jobflow/shared";
import { api } from "./api";

export const companiesApi = {
  getAll: () => api.get<Company[]>("/companies"),
  getById: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: CreateCompanyInput) => api.post<Company>("/companies", data),
  update: (id: string, data: UpdateCompanyInput) =>
    api.patch<Company>(`/companies/${id}`, data),
  remove: (id: string) => api.delete<void>(`/companies/${id}`),
};

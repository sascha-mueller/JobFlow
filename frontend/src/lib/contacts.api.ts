import type { Contact, CreateContactInput, UpdateContactInput } from "@jobflow/shared";
import { api } from "./api";

export const contactsApi = {
  getAll: () => api.get<Contact[]>("/contacts"),
  create: (data: CreateContactInput) => api.post<Contact>("/contacts", data),
  update: (id: string, data: UpdateContactInput) =>
    api.patch<Contact>(`/contacts/${id}`, data),
  remove: (id: string) => api.delete<void>(`/contacts/${id}`),
};

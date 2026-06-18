import { useAuthStore } from "@/stores/auth.store";

const BASE = "/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await useAuthStore.getState().refresh();
    if (!refreshed) throw new ApiError(401, "Unauthorized");

    const newToken = useAuthStore.getState().accessToken;
    const retry = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        ...init.headers,
      },
    });

    if (!retry.ok) throw new ApiError(retry.status, await retry.text());
    return retry.json() as Promise<T>;
  }

  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

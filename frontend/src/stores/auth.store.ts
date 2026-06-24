import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  init: () => Promise<void>;
}

async function loadProfileName(accessToken: string): Promise<{ firstName?: string; lastName?: string }> {
  try {
    const res = await fetch("/api/profiles/me", {
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};
    const profile = await res.json();
    return { firstName: profile.firstName, lastName: profile.lastName };
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Login fehlgeschlagen");
    }

    const data = await res.json();
    const name = await loadProfileName(data.accessToken);
    set({
      user: { ...data.user, ...name },
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  register: async (email, password, firstName, lastName) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Registrierung fehlgeschlagen");
    }

    const data = await res.json();

    await fetch("/api/profiles", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.accessToken}`,
      },
      body: JSON.stringify({ firstName, lastName }),
    });

    set({
      user: { ...data.user, firstName, lastName },
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Store leeren auch wenn Server 401 zurückgibt (USER-2)
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
      window.location.replace("/login");
    }
  },

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        set({ user: null, accessToken: null, isAuthenticated: false });
        return false;
      }

      const data = await res.json();
      const name = await loadProfileName(data.accessToken);
      set({
        user: { ...data.user, ...name },
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
      return true;
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
      return false;
    }
  },

  init: async () => {
    await get().refresh();
    set({ isInitializing: false });
  },
}));

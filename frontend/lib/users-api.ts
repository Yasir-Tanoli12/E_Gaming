import { apiRequest } from "./api";
import type { UserRole } from "./types/auth";

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  _count?: { authLogs: number };
}

export interface AdminAllowlistEntry {
  email: string;
  addedAt: string;
}

export const usersApi = {
  list() {
    return apiRequest<ApiUser[]>("/users");
  },

  updateRole(userId: string, role: UserRole) {
    return apiRequest<ApiUser>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  listAdminAllowlist() {
    return apiRequest<AdminAllowlistEntry[]>("/users/admin-allowlist");
  },

  addAdminAllowlist(email: string) {
    return apiRequest<{ email: string; addedAt?: string; alreadyExists: boolean }>(
      "/users/admin-allowlist",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  removeAdminAllowlist(email: string) {
    return apiRequest<{ removed: boolean }>(
      `/users/admin-allowlist/${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );
  },
};

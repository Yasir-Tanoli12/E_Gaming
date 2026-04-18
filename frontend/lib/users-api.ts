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
};

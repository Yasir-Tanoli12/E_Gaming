import { apiRequest } from "./api";
import type { AuthTokens, User } from "./types/auth";

const AUTH = "/auth";
const ADMIN = "/admin";

export const authApi = {
  requestAdminOtp(email: string) {
    return apiRequest<{ message: string }>(`${ADMIN}/request-otp`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyAdminOtp(body: { email: string; otp: string }) {
    return apiRequest<AuthTokens>(`${ADMIN}/verify-otp`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  promoteAdmin(email: string) {
    return apiRequest<{ message: string; email: string }>(`${ADMIN}/promote`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  refresh() {
    return apiRequest<AuthTokens>(`${AUTH}/refresh`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  logout() {
    return apiRequest<{ message: string }>(`${AUTH}/logout`, {
      method: "POST",
    });
  },

  me() {
    return apiRequest<User | null>(`${AUTH}/me`);
  },
};

import { apiRequest } from "./api";
import type {
  AuthTokens,
  RegisterInput,
  RegisterResponse,
  LoginInput,
  LoginResponse,
  VerifyCodeInput,
  ResetPasswordInput,
  User,
} from "./types/auth";

const AUTH = "/auth";

export const authApi = {
  register(body: RegisterInput) {
    return apiRequest<RegisterResponse>(`${AUTH}/register`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  verifyEmail(body: VerifyCodeInput) {
    return apiRequest<AuthTokens>(`${AUTH}/verify-email`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: LoginInput) {
    return apiRequest<LoginResponse>(`${AUTH}/login`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  verifyLogin(body: VerifyCodeInput) {
    return apiRequest<AuthTokens>(`${AUTH}/verify-login`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  requestPasswordReset(email: string) {
    return apiRequest<{ message: string }>(`${AUTH}/request-password-reset`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(body: ResetPasswordInput) {
    return apiRequest<{ message: string }>(`${AUTH}/reset-password`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<AuthTokens>(`${AUTH}/refresh`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  me() {
    return apiRequest<User | null>(`${AUTH}/me`);
  },
};

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  lastLoginAt?: string | null;
}

export function getDashboardPath(user: User): string {
  return user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
}

export interface AuthTokens {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface RegisterResponse {
  user: User;
  requiresVerification: true;
  message: string;
  code?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResponse =
  | AuthTokens
  | { requiresVerification: true; email: string; message: string; code?: string };

export interface VerifyCodeInput {
  email: string;
  code: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

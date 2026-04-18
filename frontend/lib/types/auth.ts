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

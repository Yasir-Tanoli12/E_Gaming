"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/lib/auth-api";
import { AUTH_EXPIRED_EVENT, ApiError } from "@/lib/api";
import type { User } from "@/lib/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextValue extends AuthState {
  requestAdminOtp: (email: string) => Promise<{ message: string }>;
  verifyAdminOtp: (input: { email: string; otp: string }) => Promise<User>;
  promoteAdmin: (email: string) => Promise<{ message: string; email: string }>;
  logout: () => void | Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const setUser = useCallback((u: User | null) => setUserState(u), []);

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUserState(me ?? null);
    } catch (error) {
      if (error instanceof ApiError && error.status >= 500) {
        setUserState(null);
        return;
      }
      try {
        const tokens = await authApi.refresh();
        setUserState(tokens.user);
      } catch {
        await authApi.logout().catch(() => {});
        setUserState(null);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    function handleAuthExpired() {
      setUserState(null);
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  const requestAdminOtp = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      return await authApi.requestAdminOtp(email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyAdminOtp = useCallback(async (input: { email: string; otp: string }) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.verifyAdminOtp(input);
      setUserState(tokens.user);
      return tokens.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const promoteAdmin = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      return await authApi.promoteAdmin(email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUserState(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isInitialized,
    requestAdminOtp,
    verifyAdminOtp,
    promoteAdmin,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

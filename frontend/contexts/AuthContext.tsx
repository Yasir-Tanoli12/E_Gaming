"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/lib/auth-api";
import { authStorage } from "@/lib/auth-storage";
import type {
  User,
  RegisterInput,
  LoginInput,
  VerifyCodeInput,
  ResetPasswordInput,
} from "@/lib/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<{
    user?: User;
    requiresVerification?: boolean;
    email?: string;
    code?: string;
  }>;
  register: (input: RegisterInput) => Promise<{ requiresVerification: boolean; code?: string }>;
  verifyEmail: (input: VerifyCodeInput) => Promise<User>;
  verifyLogin: (input: VerifyCodeInput) => Promise<User>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const setUser = useCallback((u: User | null) => setUserState(u), []);

  const persistTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      authStorage.setTokens(accessToken, refreshToken);
    },
    []
  );

  const loadUser = useCallback(async () => {
    const access = authStorage.getAccessToken();
    if (!access) {
      setUserState(null);
      setIsInitialized(true);
      return;
    }
    try {
      const me = await authApi.me();
      setUserState(me ?? null);
    } catch {
      const refresh = authStorage.getRefreshToken();
      if (!refresh) {
        authStorage.clear();
        setUserState(null);
        setIsInitialized(true);
        return;
      }
      try {
        const tokens = await authApi.refresh(refresh);
        authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        setUserState(tokens.user);
      } catch {
        authStorage.clear();
        setUserState(null);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      setIsLoading(true);
      try {
        const res = await authApi.login(input);
        if ("requiresVerification" in res && res.requiresVerification) {
          return { requiresVerification: true, email: res.email, code: res.code };
        }
        const tokens = res as { accessToken: string; refreshToken: string; user: User };
        persistTokens(tokens.accessToken, tokens.refreshToken);
        setUserState(tokens.user);
        return { user: tokens.user };
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens]
  );

  const register = useCallback(async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(input);
      return { requiresVerification: true, code: res.code };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async (input: VerifyCodeInput) => {
      setIsLoading(true);
      try {
        const tokens = await authApi.verifyEmail(input);
        persistTokens(tokens.accessToken, tokens.refreshToken);
        setUserState(tokens.user);
        return tokens.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens]
  );

  const verifyLogin = useCallback(
    async (input: VerifyCodeInput) => {
      setIsLoading(true);
      try {
        const tokens = await authApi.verifyLogin(input);
        persistTokens(tokens.accessToken, tokens.refreshToken);
        setUserState(tokens.user);
        return tokens.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens]
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setUserState(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(input);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isInitialized,
    login,
    register,
    verifyEmail,
    verifyLogin,
    logout,
    requestPasswordReset,
    resetPassword,
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

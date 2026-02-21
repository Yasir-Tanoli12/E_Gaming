"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/types/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ email, password });
      if (result.requiresVerification && result.email) {
        const params = new URLSearchParams({ email: result.email, flow: "login" });
        if (result.code) params.set("code", result.code);
        router.push(`/verify-email?${params.toString()}`);
        return;
      }
      if (result.user) {
        router.push(getDashboardPath(result.user));
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-1 text-zinc-400">
        Enter your email and password. We&apos;ll send a code to your email if verification is needed.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          error={error && !password ? error : undefined}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          error={error && password ? error : undefined}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-emerald-400 hover:text-emerald-300"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={isLoading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  if (sent) {
    return (
      <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="mt-2 text-zinc-400">
          If an account exists for <strong className="text-zinc-200">{email}</strong>, we&apos;ve sent a 6-digit reset code. Use it on the next screen.
        </p>
        <Link
          href={`/reset-password?email=${encodeURIComponent(email)}`}
          className="mt-6 block"
        >
          <Button fullWidth>Continue to reset password</Button>
        </Link>
        <p className="mt-6 text-center text-sm text-zinc-400">
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-bold text-white">Forgot password</h1>
      <p className="mt-1 text-zinc-400">
        Enter your email and we&apos;ll send you a 6-digit code to reset your password.
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
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth loading={isLoading}>
          Send reset code
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

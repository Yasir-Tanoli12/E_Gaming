"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/types/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, verifyLogin, isLoading } = useAuth();
  const emailParam = searchParams.get("email") ?? "";
  const flow = searchParams.get("flow") ?? "register";
  const codeParam = searchParams.get("code") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(codeParam);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail((prev) => (emailParam || prev));
    setCode((prev) => (codeParam || prev));
  }, [emailParam, codeParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (code.length !== 6) {
      setError("Code must be 6 digits");
      return;
    }
    try {
      let user;
      if (flow === "login") {
        user = await verifyLogin({ email: email.trim(), code });
      } else {
        user = await verifyEmail({ email: email.trim(), code });
      }
      router.push(getDashboardPath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  }

  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-bold text-white">Verify your email</h1>
      <p className="mt-1 text-zinc-400">
        Enter the 6-digit code we sent to your email. It expires in 10 minutes.
      </p>
      {code && (
        <div className="mt-4 rounded-lg bg-emerald-500/20 px-4 py-3 text-center">
          <p className="text-xs text-zinc-400">Your verification code</p>
          <p className="text-2xl font-mono font-bold tracking-[0.4em] text-emerald-400">
            {code}
          </p>
        </div>
      )}
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
        <Input
          label="Verification code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth loading={isLoading}>
          Verify
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        <Link href={flow === "login" ? "/login" : "/register"} className="text-emerald-400 hover:text-emerald-300">
          Back to {flow === "login" ? "sign in" : "sign up"}
        </Link>
      </p>
    </div>
  );
}

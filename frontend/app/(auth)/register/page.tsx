"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PASSWORD_HINT =
  "At least 8 characters, with uppercase, lowercase, and a number.";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await register({
        email,
        password,
        name: name || undefined,
        phone: phone || undefined,
      });
      if (result.requiresVerification) {
        const params = new URLSearchParams({ email, flow: "register" });
        if (result.code) params.set("code", result.code);
        router.push(`/verify-email?${params.toString()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-bold text-white">Create account</h1>
      <p className="mt-1 text-zinc-400">
        We&apos;ll send a 6-digit code to your email to verify your account.
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
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          error={error && error.toLowerCase().includes("password") ? error : undefined}
        />
        <p className="text-xs text-zinc-500">{PASSWORD_HINT}</p>
        <Input
          label="Name (optional)"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
        />
        {error && !error.toLowerCase().includes("password") && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <Button type="submit" fullWidth loading={isLoading}>
          Sign up
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

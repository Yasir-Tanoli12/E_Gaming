"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { requestAdminOtp, verifyAdminOtp, isLoading } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  /** Avoid rapid repeat POSTs; server also rate-limits per email. */
  const [otpCooldownSec, setOtpCooldownSec] = useState(0);

  useEffect(() => {
    if (otpCooldownSec <= 0) return;
    const t = window.setInterval(() => {
      setOtpCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [otpCooldownSec]);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const res = await requestAdminOtp(email);
      setInfo(res.message);
      setStep("otp");
      setOtp("");
      setOtpCooldownSec(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await verifyAdminOtp({ email, otp: otp.trim() });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
  }

  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-bold text-white">Admin sign in</h1>
      <p className="mt-1 text-zinc-400">
        {step === "email"
          ? "Enter the configured admin email. We will email you a one-time code that expires in 5 minutes."
          : "Enter the 6-digit code from your email."}
      </p>

      {step === "email" ? (
        <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            error={error || undefined}
          />
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={otpCooldownSec > 0}
          >
            {otpCooldownSec > 0 ? `Wait ${otpCooldownSec}s to resend` : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
          <p className="text-sm text-zinc-400">
            Code sent to <span className="font-medium text-zinc-200">{email}</span>
          </p>
          {info ? <p className="text-sm text-emerald-400/90">{info}</p> : null}
          <Input
            label="One-time code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
            error={error || undefined}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="sm:flex-1"
              onClick={() => {
                setStep("email");
                setError("");
                setInfo("");
                setOtp("");
              }}
            >
              Back
            </Button>
            <Button type="submit" fullWidth loading={isLoading} className="sm:flex-1">
              Sign in
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}

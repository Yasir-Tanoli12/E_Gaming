"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return (
    <div className="auth-card rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 text-center text-zinc-400">
      Redirecting to sign in…
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { getDashboardPath } from "@/lib/types/auth";

export default function Home() {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuth();

  useEffect(() => {
    if (isInitialized && user) {
      router.replace(getDashboardPath(user));
    }
  }, [user, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">
            E-Gaming
          </span>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </span>
                <Button variant="secondary" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">
        {user ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              E-Gaming
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Sign in or create an account to continue.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

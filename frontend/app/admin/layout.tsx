"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { contentApi } from "@/lib/content-api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    let cancelled = false;
    async function loadLogo() {
      try {
        const data = await contentApi.getPublic();
        if (!cancelled) setLogoUrl(data.contacts?.logoUrl || "");
      } catch {
        if (!cancelled) setLogoUrl("");
      }
    }
    loadLogo();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3 text-lg font-semibold text-white">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="CashlySweeps logo"
                  className="h-9 w-9 rounded-lg object-cover ring-1 ring-cyan-300/50 shadow-[0_0_18px_rgba(34,211,238,0.32)]"
                />
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-xs font-black text-white">
                  CS
                </span>
              )}
              CashlySweeps Admin
            </Link>
            <Link href="/admin/games" className="text-sm text-zinc-400 hover:text-zinc-200">
              Games
            </Link>
            <Link href="/admin/news" className="text-sm text-zinc-400 hover:text-zinc-200">
              News
            </Link>
            <Link href="/admin/content" className="text-sm text-zinc-400 hover:text-zinc-200">
              Content
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              User view
            </Link>
            <span className="text-sm text-zinc-500">{user.email}</span>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

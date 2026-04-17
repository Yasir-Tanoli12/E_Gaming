"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { contentApi } from "@/lib/content-api";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Games", href: "/admin/games" },
  { label: "News", href: "/admin/news" },
  { label: "Contacts", href: "/admin/contacts" },
  { label: "Blogs", href: "/admin/blogs" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Site", href: "/admin/site" },
  { label: "Guidelines", href: "/admin/guidelines" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileNavOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href="/admin/dashboard"
              className="flex shrink-0 items-center gap-2 text-base font-semibold text-white sm:gap-3 sm:text-lg"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="CashlySweeps logo"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-[#EDC537]/50"
                />
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#990808] to-[#EDC537] text-xs font-black text-white">
                  CS
                </span>
              )}
              <span className="hidden truncate sm:inline">CashlySweeps Admin</span>
              <span className="truncate sm:hidden">Admin</span>
            </Link>
            <nav className="hidden items-center gap-2 lg:flex">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    pathname === item.href
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <nav className="hidden items-center gap-3 lg:flex">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-zinc-200"
              >
                User view
              </Link>
              <span className="max-w-[140px] truncate text-sm text-zinc-500 sm:max-w-[200px]">
                {user.email}
              </span>
              <Button variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </nav>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-600 text-zinc-300 transition hover:bg-zinc-800 hover:text-white lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className={`fixed inset-0 z-50 lg:hidden ${mobileNavOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[min(300px,85vw)] flex-col border-l border-zinc-700 bg-zinc-900 shadow-xl transition-transform duration-300 ease-out ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-4">
            <span className="font-semibold text-white">Menu</span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-600 text-zinc-300 transition hover:bg-zinc-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-medium transition ${
                  pathname === item.href
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-zinc-700" />
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              User view
            </Link>
            <div className="mt-2 rounded-xl bg-zinc-800/50 px-4 py-3">
              <p className="text-xs text-zinc-500">Signed in as</p>
              <p className="mt-0.5 truncate text-sm text-zinc-300">{user.email}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
              className="mt-4 w-full"
            >
              Sign out
            </Button>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const navLinkClass = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10"
        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
    }`;

  return (
    <div className="dark min-h-screen bg-[#09090b] text-zinc-100 antialiased [&_label]:!text-zinc-200">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-2 ring-offset-[#09090b] focus-visible:ring-2 focus-visible:ring-amber-500/50 sm:gap-3"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                />
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold tracking-tight text-zinc-200 ring-1 ring-white/10">
                  ST
                </span>
              )}
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-white sm:text-base">
                  SWEEPSTOWN
                </span>
                <span className="hidden text-[11px] font-medium uppercase tracking-wider text-zinc-500 sm:block">
                  Admin
                </span>
              </div>
            </Link>

            <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-0.5 xl:flex xl:ml-4">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(pathname === item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 xl:flex">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 transition hover:text-zinc-300"
              >
                Public site
              </Link>
              <span
                className="max-w-[min(220px,28vw)] truncate border-l border-white/10 pl-3 text-xs text-zinc-500"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <Button variant="secondary" className="!py-2 text-sm" onClick={logout}>
                Sign out
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white xl:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`fixed inset-0 z-50 xl:hidden ${mobileNavOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[min(320px,100%)] flex-col border-l border-white/10 bg-[#0c0c0f] shadow-2xl transition-transform duration-200 ease-out ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <span className="text-sm font-semibold text-white">Navigation</span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-lg px-4 py-3 text-[15px] font-medium ${
                  pathname === item.href
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-3 border-t border-white/10" />
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg px-4 py-3 text-[15px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            >
              View public site
            </Link>
            <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Signed in</p>
              <p className="mt-1 break-all text-sm text-zinc-300">{user.email}</p>
            </div>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
            >
              Sign out
            </Button>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

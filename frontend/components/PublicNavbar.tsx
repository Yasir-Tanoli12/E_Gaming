"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentApi, type SiteContacts } from "@/lib/content-api";
import { SocialContactIcons } from "@/components/SocialContactIcons";

type NavItem =
  {
    label: string;
    href: string;
    matchPath: (p: string) => boolean;
  };

const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/dashboard", matchPath: (p) => p === "/dashboard" },
  { label: "GAMES", href: "/games", matchPath: (p) => p === "/games" },
  { label: "ABOUT US", href: "/about-us", matchPath: (p) => p === "/about-us" },
  { label: "BLOGS", href: "/blogs", matchPath: (p) => p === "/blogs" },
  { label: "GUIDELINES", href: "/privacy-policy", matchPath: (p) => p === "/privacy-policy" },
  { label: "CONTACT US", href: "/contact-us", matchPath: (p) => p === "/contact-us" },
];
function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.matchPath(pathname);
}

export type PublicNavbarVariant = "default" | "overlay";

type PublicNavbarProps = {
  /** `overlay`: semi-transparent bar for use over full-bleed hero video (dashboard). */
  variant?: PublicNavbarVariant;
};

export function PublicNavbar({ variant = "default" }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contacts, setContacts] = useState<SiteContacts | null>(null);
  const [contactsError, setContactsError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadContacts() {
      try {
        const data = await contentApi.getPublic();
        if (!active) return;
        setContacts(data.contacts ?? null);
        setContactsError("");
      } catch (error) {
        if (!active) return;
        setContacts(null);
        setContactsError(error instanceof Error ? error.message : "Failed to load contacts");
      }
    }
    loadContacts();
    return () => {
      active = false;
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

  const logoUrl = contacts?.logoUrl ?? "";

  const headerSurface =
    variant === "overlay"
      ? "border-b border-[#EA3699]/30 bg-gradient-to-b from-[#161015]/78 via-[#1f0a14]/65 to-[#161015]/50 backdrop-blur-xl"
      : "border-b-[3px] border-[#161015] bg-[#161015]/95 backdrop-blur-xl";

  return (
    <>
      <header className={`sticky top-0 z-50 w-full min-w-0 ${headerSurface}`}>
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] ${variant === "overlay" ? "opacity-90" : ""}`}
        />
        <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-3 py-4 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] sm:gap-4">
          <Link
            href="/dashboard"
            className="group relative flex items-center gap-3 text-xl font-black tracking-wide text-[#EEEDEE]"
          >
            <span className="absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r from-[#EB523F]/40 to-[#EA3699]/35 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="SWEEPSTOWN logo"
                className="h-10 w-10 rounded-full border-2 border-[#AAE847] object-cover shadow-[3px_3px_0_#161015] transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#161015] bg-gradient-to-br from-[#EB523F] to-[#EA3699] text-sm font-black text-[#EEEDEE] shadow-[3px_3px_0_#161015]">
                ST
              </span>
            )}
            <span className="sw-text-wobble inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
              SWEEPSTOWN
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-bold transition-transform duration-200 ${
                    active
                      ? "border-2 border-[#161015] bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] text-[#161015] shadow-[4px_4px_0_#161015]"
                      : "text-[#EEEDEE]/90 hover:-translate-y-0.5 hover:scale-[1.03] hover:text-[#AAE847]"
                  }`}
                >
                  {!active && (
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#EB523F]/0 via-[#EA3699]/25 to-[#EB523F]/0 opacity-0 transition duration-300 group-hover:opacity-100" />
                  )}
                  {!active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r from-[#EB523F] to-[#AAE847] transition-all duration-300 group-hover:w-3/4" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {contactsError && (
              <span className="max-w-[180px] truncate text-xs text-red-300/80">{contactsError}</span>
            )}
            <SocialContactIcons contacts={contacts} size="md" gapClass="gap-2" />
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#AAE847]/60 bg-[#EB523F]/25 text-[#EEEDEE] shadow-[3px_3px_0_#161015] transition hover:bg-[#EB523F]/40 lg:hidden"
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
      </header>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-[60] lg:hidden ${mobileNavOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileNavOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col border-l-[3px] border-[#161015] bg-[#161015]/98 shadow-[6px_0_0_#EB523F] transition-transform duration-300 ease-out ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b-2 border-[#EB523F]/40 px-4 py-4">
            <span className="text-lg font-bold text-white">Menu</span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600 text-zinc-300 transition hover:bg-zinc-700"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-xl px-4 py-3 text-base font-semibold transition ${active ? "border border-[#AAE847]/50 bg-gradient-to-r from-[#EB523F]/35 to-[#EA3699]/35 text-[#EEEDEE]" : "text-[#EEEDEE]/90 hover:bg-[#EB523F]/15"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t-2 border-[#EB523F]/30 p-4">
            <div className="flex justify-center">
              <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

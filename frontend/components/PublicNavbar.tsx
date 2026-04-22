"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentApi, type SiteContacts } from "@/lib/content-api";
import { SocialContactIcons } from "@/components/SocialContactIcons";

type DashboardScrollSection = "home" | "games" | "support";

type NavItem =
  | {
      label: string;
      href: string;
      dashboardScrollSpy: DashboardScrollSection;
    }
  | {
      label: string;
      href: string;
      matchPath: (p: string) => boolean;
    };

const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/dashboard#home", dashboardScrollSpy: "home" },
  { label: "GAMES", href: "/dashboard#games", dashboardScrollSpy: "games" },
  { label: "ABOUT US", href: "/about-us", matchPath: (p) => p === "/about-us" },
  { label: "BLOGS", href: "/blogs", matchPath: (p) => p === "/blogs" },
  { label: "GUIDELINES", href: "/privacy-policy", matchPath: (p) => p === "/privacy-policy" },
  { label: "CONTACT US", href: "/dashboard#support", dashboardScrollSpy: "support" },
];

function computeDashboardScrollSection(): DashboardScrollSection {
  const home = document.getElementById("home");
  const games = document.getElementById("games");
  const support = document.getElementById("support");
  if (!home || !games || !support) return "home";

  const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const headerOffset = 96;
  const y = window.scrollY + headerOffset;
  const gTop = top(games);
  const sTop = top(support);

  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
  if (nearBottom) return "support";

  if (y >= sTop - 100) return "support";
  if (y >= gTop - 56) return "games";
  return "home";
}

function isNavItemActive(
  item: NavItem,
  pathname: string,
  dashboardSection: DashboardScrollSection
): boolean {
  if ("dashboardScrollSpy" in item) {
    return pathname === "/dashboard" && dashboardSection === item.dashboardScrollSpy;
  }
  return item.matchPath(pathname);
}

function scrollToDashboardSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", `#${id}`);
  }
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contacts, setContacts] = useState<SiteContacts | null>(null);
  const [contactsError, setContactsError] = useState("");
  const [dashboardSection, setDashboardSection] = useState<DashboardScrollSection>("home");

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
    if (pathname !== "/dashboard") return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      setDashboardSection(computeDashboardScrollSection());
    };

    const onScrollOrResize = () => {
      if (!raf) raf = window.requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
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

  const handleDashboardNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (pathname !== "/dashboard") return;
      const hash = href.includes("#") ? href.split("#")[1] : "";
      if (!hash) return;
      e.preventDefault();
      scrollToDashboardSection(hash);
    },
    [pathname]
  );

  const logoUrl = contacts?.logoUrl ?? "";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#EDC537]/20 bg-[#0f0808]/90 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EDC537]/70 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/dashboard#home"
            onClick={(e) => handleDashboardNavClick(e, "/dashboard#home")}
            className="group relative flex items-center gap-3 text-xl font-black tracking-wide text-white"
          >
            <span className="absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r from-[#990808]/30 to-[#EDC537]/30 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="SWEEPSTOWN logo"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_24px_rgba(237,197,55,0.35)] transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#990808] to-[#EDC537] text-sm font-black shadow-[0_0_24px_rgba(237,197,55,0.35)]">
                ST
              </span>
            )}
            <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
              SWEEPSTOWN
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname, dashboardSection);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleDashboardNavClick(e, item.href)}
                  className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#990808] via-[#E85D04] to-[#EDC537] text-white shadow-[0_0_28px_rgba(237,197,55,0.4)]"
                      : "text-[#fef3c7]/85 hover:-translate-y-0.5 hover:scale-[1.03] hover:text-white"
                  }`}
                >
                  {!active && (
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#990808]/0 via-[#EDC537]/25 to-[#990808]/0 opacity-0 transition duration-300 group-hover:opacity-100" />
                  )}
                  {!active && (
                    <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-[#990808] to-[#EDC537] transition-all duration-300 group-hover:w-3/4" />
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EDC537]/40 bg-[#990808]/20 text-[#fef3c7] shadow-[0_0_18px_rgba(237,197,55,0.3)] transition hover:bg-[#990808]/30 lg:hidden"
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
          className={`absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col border-l border-[#EDC537]/30 bg-[#0f0808]/98 shadow-[0_0_60px_rgba(237,197,55,0.2)] transition-transform duration-300 ease-out ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-[#EDC537]/20 px-4 py-4">
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
              const active = isNavItemActive(item, pathname, dashboardSection);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    handleDashboardNavClick(e, item.href);
                    setMobileNavOpen(false);
                  }}
                  className={`rounded-xl px-4 py-3 text-base font-medium transition ${active ? "bg-gradient-to-r from-[#990808]/50 to-[#EDC537]/40 text-white" : "text-[#fef3c7]/90 hover:bg-[#EDC537]/15"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#EDC537]/20 p-4">
            <div className="flex justify-center">
              <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

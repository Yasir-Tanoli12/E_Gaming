"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentApi, type SiteContacts } from "@/lib/content-api";

const NAV_ITEMS = [
  { label: "HOME", href: "/dashboard", match: (p: string) => p === "/dashboard" },
  { label: "GAMES", href: "/dashboard#games", match: (p: string) => p === "/dashboard" },
  { label: "ABOUT US", href: "/about-us", match: (p: string) => p === "/about-us" },
  { label: "BLOGS", href: "/blogs", match: (p: string) => p === "/blogs" },
  { label: "GUIDELINES", href: "/privacy-policy", match: (p: string) => p === "/privacy-policy" },
  { label: "CONTACT US", href: "/dashboard#support", match: (p: string) => p === "/dashboard" },
];

export function PublicNavbar() {
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
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const logoUrl = contacts?.logoUrl ?? "";
  const whatsappLink = contacts?.whatsapp
    ? contacts.whatsapp.startsWith("http")
      ? contacts.whatsapp
      : `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`
    : "";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#EDC537]/20 bg-[#0f0808]/90 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EDC537]/70 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="group relative flex items-center gap-3 text-xl font-black tracking-wide text-white">
            <span className="absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r from-[#990808]/30 to-[#EDC537]/30 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
            {logoUrl ? (
              <img src={logoUrl} alt="SWEEPSTOWN logo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_24px_rgba(237,197,55,0.35)] transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#990808] to-[#EDC537] text-sm font-black shadow-[0_0_24px_rgba(237,197,55,0.35)]">ST</span>
            )}
            <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">SWEEPSTOWN</span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active ? "bg-gradient-to-r from-[#990808] via-[#E85D04] to-[#EDC537] text-white shadow-[0_0_28px_rgba(237,197,55,0.4)]" : "text-[#fef3c7]/85 hover:-translate-y-0.5 hover:scale-[1.03] hover:text-white"
                  }`}
                >
                  {!active && <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#990808]/0 via-[#EDC537]/25 to-[#990808]/0 opacity-0 transition duration-300 group-hover:opacity-100" />}
                  {!active && <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-[#990808] to-[#EDC537] transition-all duration-300 group-hover:w-3/4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {contactsError && (
              <span className="max-w-[180px] truncate text-xs text-red-300/80">
                {contactsError}
              </span>
            )}
            {contacts?.facebook && (
              <a href={contacts.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EDC537]/40 bg-[#990808]/20 text-[#fef3c7] shadow-[0_0_18px_rgba(237,197,55,0.3)] transition hover:-translate-y-0.5 hover:bg-[#990808]/30">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.79-3.88 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.89h-2.35v6.99A10 10 0 0 0 22 12z" /></svg>
              </a>
            )}
            {contacts?.whatsapp && (
              <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EDC537]/40 bg-[#EDC537]/20 text-[#1a0a0a] shadow-[0_0_18px_rgba(237,197,55,0.35)] transition hover:-translate-y-0.5 hover:bg-[#EDC537]/30">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.54 0 .2 5.34.2 11.86c0 2.09.55 4.14 1.59 5.95L0 24l6.37-1.67a11.86 11.86 0 0 0 5.7 1.46h.01c6.53 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.43-8.45zM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.91-9.88a9.8 9.8 0 0 1 7.02 2.91 9.79 9.79 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.91 9.89zm5.43-7.42c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.33.2 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" /></svg>
              </a>
            )}
          </div>

          <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EDC537]/40 bg-[#990808]/20 text-[#fef3c7] shadow-[0_0_18px_rgba(237,197,55,0.3)] transition hover:bg-[#990808]/30 lg:hidden">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </header>

      <div role="dialog" aria-modal="true" aria-label="Navigation menu" className={`fixed inset-0 z-[60] lg:hidden ${mobileNavOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileNavOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileNavOpen(false)} />
        <div className={`absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col border-l border-[#EDC537]/30 bg-[#0f0808]/98 shadow-[0_0_60px_rgba(237,197,55,0.2)] transition-transform duration-300 ease-out ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[#EDC537]/20 px-4 py-4">
            <span className="text-lg font-bold text-white">Menu</span>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600 text-zinc-300 transition hover:bg-zinc-700">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link key={item.label} href={item.href} onClick={() => setMobileNavOpen(false)} className={`rounded-xl px-4 py-3 text-base font-medium transition ${active ? "bg-gradient-to-r from-[#990808]/50 to-[#EDC537]/40 text-white" : "text-[#fef3c7]/90 hover:bg-[#EDC537]/15"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#EDC537]/20 p-4">
            <div className="flex justify-center gap-3">
              {contacts?.facebook && (
                <a href={contacts.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDC537]/40 bg-[#990808]/20 text-[#fef3c7] shadow-[0_0_18px_rgba(237,197,55,0.3)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.79-3.88 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.89h-2.35v6.99A10 10 0 0 0 22 12z" /></svg>
                </a>
              )}
              {contacts?.whatsapp && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDC537]/40 bg-[#EDC537]/20 text-[#1a0a0a] shadow-[0_0_18px_rgba(237,197,55,0.35)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.54 0 .2 5.34.2 11.86c0 2.09.55 4.14 1.59 5.95L0 24l6.37-1.67a11.86 11.86 0 0 0 5.7 1.46h.01c6.53 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.43-8.45zM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.91-9.88a9.8 9.8 0 0 1 7.02 2.91 9.79 9.79 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.91 9.89zm5.43-7.42c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.33.2 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" /></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

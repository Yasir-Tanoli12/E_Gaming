"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { contentApi } from "@/lib/content-api";
import { getApiBaseUrl } from "@/lib/api";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { mailtoHref } from "@/lib/contact-links";

export function SiteFooter() {
  const [logoUrl, setLogoUrl] = useState("");
  const [contacts, setContacts] = useState<{
    facebook?: string;
    whatsapp?: string;
    instagram?: string;
    telegram?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadContent() {
      try {
        const data = await contentApi.getPublicCached();
        if (!active) return;
        setContacts(data.contacts ?? null);
        setLogoUrl(data.contacts?.logoUrl ?? "");
      } catch {
        if (!active) return;
        setContacts(null);
        setLogoUrl("");
      }
    }
    void loadContent();
    return () => {
      active = false;
    };
  }, []);

  const apiBaseUrl = getApiBaseUrl();
  const privacyPolicyPdfUrl = useMemo(
    () => `${apiBaseUrl}/content/documents/privacy-policy`,
    [apiBaseUrl],
  );
  const socialResponsibilityPdfUrl = useMemo(
    () => `${apiBaseUrl}/content/documents/social-responsibility`,
    [apiBaseUrl],
  );

  return (
    <footer
      id="support"
      className="relative mt-8 scroll-mt-24 border-t border-[#EDC537]/20 bg-[#0f0808]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-40 w-40 animate-orbit rounded-full bg-[#990808]/25 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-44 w-44 animate-orbit-reverse rounded-full bg-[#EDC537]/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="SWEEPSTOWN logo"
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_24px_rgba(237,197,55,0.3)]"
                />
              ) : (
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#990808] to-[#EDC537] text-sm font-black text-white shadow-[0_0_20px_rgba(237,197,55,0.35)]">
                  ST
                </span>
              )}
              <h3 className="text-xl font-black text-white">SWEEPSTOWN</h3>
            </div>
            <p className="mt-3 text-sm text-[#fef3c7]/80">
              Play trending games with credentials. Get access from our support team or jump in straight away.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#EDC537]">Quick Links</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/games" className="block text-[#fef3c7]/80 transition hover:text-white">
                Games
              </Link>
              <Link href="/about-us" className="block text-[#fef3c7]/80 transition hover:text-white">
                About Us
              </Link>
              <Link href="/blogs" className="block text-[#fef3c7]/80 transition hover:text-white">
                Blogs
              </Link>
              <Link href="/privacy-policy" className="block text-[#fef3c7]/80 transition hover:text-white">
                Guidelines
              </Link>
              <Link href="/contact-us" className="block text-[#fef3c7]/80 transition hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#EDC537]">Resources</p>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href={privacyPolicyPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[#fef3c7]/80 transition hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href={socialResponsibilityPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[#fef3c7]/80 transition hover:text-white"
              >
                Social Responsibility Rules
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#EDC537]">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-[#fef3c7]/80">
              {contacts?.email?.trim() ? (
                <a
                  href={mailtoHref(contacts.email)}
                  className="block text-[#fef3c7] underline-offset-2 transition hover:text-white hover:underline"
                >
                  {contacts.email}
                </a>
              ) : null}
              <p>24/7 Live Support</p>
              <div className="mt-1">
                <SocialContactIcons
                  contacts={contacts}
                  size="sm"
                  gapClass="gap-2"
                  includeEmailIcon
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#EDC537]/20 pt-4 text-xs text-[#fef3c7]/70 md:flex-row">
          <p>© {new Date().getFullYear()} SWEEPSTOWN. All rights reserved.</p>
          <p>Built for players who love to play.</p>
        </div>
      </div>
    </footer>
  );
}

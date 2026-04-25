"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { SiteContacts } from "@/lib/content-api";
import { getApiBaseUrl } from "@/lib/api";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { mailtoHref } from "@/lib/contact-links";
import { usePublicSiteContent } from "@/lib/hooks/use-site-queries";

export function SiteFooter() {
  const { data: siteContent } = usePublicSiteContent();
  const contacts: SiteContacts | null = siteContent?.contacts ?? null;
  const logoUrl = contacts?.logoUrl ?? "";

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
      className="relative mt-8 w-full min-w-0 max-w-full scroll-mt-24 border-t-[3px] border-[#161015] bg-[#161015]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-40 w-40 animate-orbit rounded-full bg-[#EB523F]/28 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-44 w-44 animate-orbit-reverse rounded-full bg-[#EA3699]/22 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full min-w-0 max-w-7xl px-[max(1rem,env(safe-area-inset-left))] py-12 pe-[max(1rem,env(safe-area-inset-right))]">
        <div className="grid min-w-0 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="SWEEPSTOWN logo"
                  className="h-11 w-11 rounded-full border-2 border-[#AAE847] object-cover shadow-[3px_3px_0_#000]"
                />
              ) : (
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#161015] bg-gradient-to-br from-[#EB523F] to-[#EA3699] text-sm font-black text-[#EEEDEE] shadow-[3px_3px_0_#000]">
                  ST
                </span>
              )}
              <h3 className="sw-brand-wordmark sw-text-wobble text-xl text-[#EEEDEE]">SWEEPSTOWN</h3>
            </div>
            <p className="mt-3 text-sm text-[#EEEDEE]/85">
              Play trending games with credentials. Get access from our support team or jump in straight away.
            </p>
          </div>

          <div>
            <p className="sw-funky-nav text-xs font-bold uppercase tracking-[0.2em] text-[#AAE847]">Quick Links</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/games" className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]">
                Games
              </Link>
              <Link href="/about-us" className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]">
                About Us
              </Link>
              <Link href="/blogs" className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]">
                Blogs
              </Link>
              <Link href="/privacy-policy" className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]">
                Guidelines
              </Link>
              <Link href="/contact-us" className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <p className="sw-funky-nav text-xs font-bold uppercase tracking-[0.2em] text-[#AAE847]">Resources</p>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href={privacyPolicyPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]"
              >
                Privacy Policy
              </a>
              <a
                href={socialResponsibilityPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[#EEEDEE]/85 transition hover:text-[#AAE847]"
              >
                Social Responsibility Rules
              </a>
            </div>
          </div>

          <div>
            <p className="sw-funky-nav text-xs font-bold uppercase tracking-[0.2em] text-[#AAE847]">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-[#EEEDEE]/85">
              {contacts?.email?.trim() ? (
                <a
                  href={mailtoHref(contacts.email)}
                  className="block font-semibold text-[#EEEDEE] underline-offset-2 transition hover:text-[#AAE847] hover:underline"
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

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t-2 border-[#EB523F]/35 pt-4 text-xs text-[#EEEDEE]/70 md:flex-row">
          <p>© {new Date().getFullYear()} SWEEPSTOWN. All rights reserved.</p>
          <p>Built for players who love to play.</p>
        </div>
      </div>
    </footer>
  );
}

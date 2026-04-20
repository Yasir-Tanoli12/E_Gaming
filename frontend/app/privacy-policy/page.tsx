"use client";

import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const publicContent = await contentApi.getPublic();
        setContent(publicContent.privacyPolicy || "Privacy policy will be available soon.");
        setLogoUrl(publicContent.contacts?.logoUrl || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load privacy policy");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="about-radiant-page min-h-screen text-[#1f140a]">
      <PublicNavbar />
      <div className="px-4 py-10">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="about-radiant-orb about-radiant-orb-left" />
          <div className="about-radiant-orb about-radiant-orb-right" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="SWEEPSTOWN logo"
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_22px_rgba(237,197,55,0.3)]"
                />
              ) : (
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#990808] to-[#EDC537] text-xs font-black text-white shadow-[0_0_20px_rgba(237,197,55,0.35)]">
                  ST
                </span>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#EDC537]">
                  Legal
                </p>
                <h1 className="mt-2 text-4xl font-black text-[#7a0b0b]">
                  Privacy Policy
                </h1>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-700">
              {error}
            </div>
          ) : (
            <article className="rounded-2xl border border-[#EDC537]/30 bg-white/90 p-6 leading-7 text-[#2b1a0a] shadow-[inset_0_0_0_1px_rgba(237,197,55,0.25),0_12px_30px_rgba(0,0,0,0.06)] whitespace-pre-wrap">
              {content}
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

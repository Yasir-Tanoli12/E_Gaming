"use client";

import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";

const DEFAULT_ABOUT_US =
  "CashlySweeps is built to provide a fast, immersive, and responsible online gaming experience with secure access, live updates, and responsive support for all players.";

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState(DEFAULT_ABOUT_US);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const publicContent = await contentApi.getPublic();
        setAboutUs(publicContent.aboutUs?.trim() || DEFAULT_ABOUT_US);
        setLogoUrl(publicContent.contacts?.logoUrl || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load About Us");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="about-radiant-page min-h-screen text-white">
      <PublicNavbar />
      <div className="px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="about-radiant-orb about-radiant-orb-left" />
        <div className="about-radiant-orb about-radiant-orb-right" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="CashlySweeps logo"
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_24px_rgba(237,197,55,0.35)]"
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#990808] to-[#EDC537] text-sm font-black text-white shadow-[0_0_24px_rgba(237,197,55,0.35)]">
                CS
              </span>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#EDC537]">
                Company
              </p>
              <h1 className="mt-2 text-4xl font-black md:text-5xl">About Us</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : (
          <div className="about-credits-shell">
            <div className="about-credits-track">
              {[0, 1].map((index) => (
                <div key={index} className="about-credits-card">
                  <p className="whitespace-pre-wrap text-center text-base leading-8 text-[#fef3c7]/95 md:text-lg">
                    {aboutUs || DEFAULT_ABOUT_US}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

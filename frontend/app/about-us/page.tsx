"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";
import { LegalSplitVisual } from "@/components/legal/LegalSplitVisual";

const DEFAULT_ABOUT_US =
  "SWEEPSTOWN is built to deliver a fast, immersive, and responsible online gaming experience — secure access, live energy, and support that actually shows up when you need it.";

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <>
        We are a focused entertainment platform built around{" "}
        <span className="sw-accent-glow font-semibold">real players</span> — not noise. Our team blends product
        craft with gaming culture so every session feels sharp, fair, and worth your time.
      </>
    ),
  },
  {
    title: "What we do",
    body: (
      <>
        We curate games, surface what is <span className="sw-accent-glow-pink font-semibold">trending</span>, and
        keep the lobby alive with updates, visuals, and channels that make it easy to jump in, play, or reach our
        team for credentials and help.
      </>
    ),
  },
  {
    title: "Our mission",
    body: (
      <>
        Raise the bar for <span className="sw-accent-glow-red font-semibold">trust and clarity</span> in online play:
        clear access paths, responsive support, and a product that stays fast as we grow — so you spend less time
        fighting the platform and more time winning.
      </>
    ),
  },
  {
    title: "Why choose us",
    body: (
      <>
        <span className="sw-accent-glow font-semibold">Bold presentation</span>, stable performance, and human
        support when it matters. We obsess over the details — from lobby motion to how quickly we answer — because
        premium play deserves a premium shell.
      </>
    ),
  },
];

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState(DEFAULT_ABOUT_US);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const publicContent = await contentApi.getPublic();
        setAboutUs(publicContent.aboutUs?.trim() || DEFAULT_ABOUT_US);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load About Us");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0F1A] text-[#EEEDEE]">
      <PublicNavbar />
      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col lg:flex-row">
        <div className="sw-legal-animate-left order-1 flex w-full flex-col justify-center border-b border-[#EB523F]/15 px-[max(1.25rem,env(safe-area-inset-left))] py-12 pe-[max(1.25rem,env(safe-area-inset-right))] lg:order-none lg:w-[40%] lg:max-w-[40%] lg:border-b-0 lg:border-r lg:border-[#EA3699]/20 lg:py-16 lg:ps-10 lg:pe-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EB523F]">Company</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#EEEDEE] md:text-5xl">
            About{" "}
            <span className="sw-accent-glow-red" style={{ textShadow: "0 0 28px rgba(235,82,63,0.5)" }}>
              Us
            </span>
          </h1>

          {loading ? (
            <div className="mt-16 flex justify-start">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-[#EB523F] border-t-transparent"
                aria-label="Loading"
              />
            </div>
          ) : error ? (
            <p className="mt-8 rounded-lg border border-[#EB523F]/40 bg-[#EB523F]/10 px-4 py-3 text-sm text-[#EEEDEE]">
              {error}
            </p>
          ) : (
            <>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#E9DFE5]/95 md:text-lg">
                {aboutUs || DEFAULT_ABOUT_US}
              </p>

              <div className="mt-10 space-y-9">
                {SECTIONS.map((s) => (
                  <section key={s.title} className="border-l-2 border-[#AAE847]/50 pl-5">
                    <h2 className="text-lg font-bold tracking-wide text-[#EEEDEE]">{s.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#E9DFE5]/88 md:text-[0.95rem]">{s.body}</p>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sw-legal-animate-right order-2 min-h-[min(52vh,420px)] w-full flex-1 lg:order-none lg:w-[60%] lg:min-h-[calc(100svh-5.25rem)]">
          <LegalSplitVisual variant="about" />
        </div>
      </main>
    </div>
  );
}

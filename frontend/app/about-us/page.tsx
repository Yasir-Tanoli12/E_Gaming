"use client";

import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";
import { LegalSplitVisual } from "@/components/legal/LegalSplitVisual";

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const publicContent = await contentApi.getPublic();
        setAboutUs((publicContent.aboutUs || "").trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load About Us");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#E9DFE5] text-[#161015]">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-20 top-24 h-80 w-80 rounded-full bg-[#EB523F]/32 blur-[100px]" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-[#EA3699]/28 blur-[110px]" />
        <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-[#AAE847]/38 blur-[90px]" />
      </div>

      <PublicNavbar />
      <main className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col lg:flex-row">
        <div className="sw-legal-animate-left order-1 flex w-full flex-col justify-center border-b-[3px] border-[#EB523F]/62 bg-[#EEEDEE]/95 px-[max(1.25rem,env(safe-area-inset-left))] py-12 pe-[max(1.25rem,env(safe-area-inset-right))] shadow-[inset_0_0_0_2px_rgba(22,16,21,0.06),inset_0_0_0_2px_rgba(234,54,153,0.22)] backdrop-blur-sm lg:order-none lg:w-[40%] lg:max-w-[40%] lg:border-b-0 lg:border-r-[3px] lg:border-[#EA3699]/58 lg:py-16 lg:ps-10 lg:pe-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EB523F]">Company</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
            <span className="text-[#161015]">About </span>
            <span className="bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] bg-clip-text text-transparent">
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
            <p className="mt-8 rounded-xl border-[3px] border-[#EB523F] bg-[#EB523F]/10 px-4 py-3 text-sm font-medium text-[#161015]">
              {error}
            </p>
          ) : aboutUs ? (
            <div className="mt-8 max-h-[min(70vh,720px)] overflow-y-auto pr-1 lg:max-h-[calc(100svh-8rem)]">
              <div className="rounded-r-xl border-l-4 border-[#AAE847] bg-[#E9DFE5]/52 py-2 pl-5 shadow-[4px_0_0_rgba(22,16,21,0.08),4px_0_0_rgba(235,82,63,0.22)]">
                <article className="whitespace-pre-wrap text-base font-medium leading-relaxed text-[#161015]/90 md:text-lg">
                  {aboutUs}
                </article>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm font-medium text-[#161015]/55">
              No About Us content has been published yet.
            </p>
          )}
        </div>

        <div className="sw-legal-animate-right order-2 min-h-[min(52vh,420px)] w-full flex-1 lg:order-none lg:w-[60%] lg:min-h-[calc(100svh-5.25rem)]">
          <LegalSplitVisual />
        </div>
      </main>
    </div>
  );
}

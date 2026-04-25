"use client";

import { useMemo } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { LegalSplitVisual } from "@/components/legal/LegalSplitVisual";
import { usePublicSiteContent } from "@/lib/hooks/use-site-queries";

export default function PrivacyPolicyPage() {
  const contentQuery = usePublicSiteContent();
  const privacyPolicy = useMemo(
    () => (contentQuery.data?.privacyPolicy ?? "").trim(),
    [contentQuery.data?.privacyPolicy],
  );
  const loading = contentQuery.isPending;
  const error =
    contentQuery.error instanceof Error
      ? contentQuery.error.message
      : contentQuery.error
        ? String(contentQuery.error)
        : "";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#E9DFE5] text-[#161015]">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-16 top-28 h-72 w-72 rounded-full bg-[#AAE847]/40 blur-[95px]" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-[#EB523F]/28 blur-[105px]" />
        <div className="absolute bottom-12 right-1/4 h-80 w-80 rounded-full bg-[#EA3699]/32 blur-[88px]" />
      </div>

      <PublicNavbar />
      <main className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col lg:flex-row">
        <div className="sw-legal-animate-left order-1 flex w-full flex-col justify-center border-b-[3px] border-[#EA3699]/58 bg-[#EEEDEE]/95 px-[max(1.25rem,env(safe-area-inset-left))] py-12 pe-[max(1.25rem,env(safe-area-inset-right))] shadow-[inset_0_0_0_2px_rgba(22,16,21,0.055),inset_0_0_0_2px_rgba(235,82,63,0.18)] backdrop-blur-sm lg:order-none lg:w-[40%] lg:max-w-[40%] lg:border-b-0 lg:border-r-[3px] lg:border-[#EB523F]/52 lg:py-16 lg:ps-10 lg:pe-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EA3699]">Legal</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
            <span className="text-[#161015]">Privacy </span>
            <span className="bg-gradient-to-r from-[#EA3699] via-[#EB523F] to-[#AAE847] bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          {loading ? (
            <div className="mt-16 flex justify-start">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-[#EA3699] border-t-transparent"
                aria-label="Loading"
              />
            </div>
          ) : error ? (
            <p className="mt-8 rounded-xl border-[3px] border-[#EB523F] bg-[#EB523F]/10 px-4 py-3 text-sm font-medium text-[#161015]">
              {error}
            </p>
          ) : privacyPolicy ? (
            <div className="mt-8 max-h-[min(70vh,720px)] overflow-y-auto pr-1 lg:max-h-[calc(100svh-8rem)]">
              <div className="rounded-r-xl border-l-4 border-[#EB523F] bg-[#E9DFE5]/52 py-2 pl-5 shadow-[4px_0_0_rgba(22,16,21,0.08),4px_0_0_rgba(170,232,71,0.32)]">
                <article className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#161015]/90 md:text-[0.95rem]">
                  {privacyPolicy}
                </article>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm font-medium text-[#161015]/55">
              No privacy policy has been published yet.
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

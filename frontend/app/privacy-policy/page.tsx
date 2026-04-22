"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";
import { LegalSplitVisual } from "@/components/legal/LegalSplitVisual";

const POLICY_SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "intro",
    title: "Introduction",
    body: (
      <>
        SWEEPSTOWN respects your privacy. This policy explains what we collect, why we collect it, and how we keep it
        safe — in plain language, with <span className="sw-accent-glow font-semibold">no surprises</span>.
      </>
    ),
  },
  {
    id: "collection",
    title: "Data Collection",
    body: (
      <>
        We only collect what we need to run the service: account details you provide, usage signals that keep the
        platform stable, and communications you send us. We do not sell personal data for{" "}
        <span className="sw-accent-glow-pink font-semibold">advertising profiles</span>.
      </>
    ),
  },
  {
    id: "use",
    title: "How We Use Data",
    body: (
      <>
        Data powers authentication, fraud prevention, support responses, and product improvements. Access is limited
        to trained staff and systems with <span className="sw-accent-glow-red font-semibold">least-privilege</span>{" "}
        controls wherever possible.
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        We use industry-standard protections for data in transit and at rest, monitor for abuse, and patch
        infrastructure regularly. No system is perfect — if we learn of a serious issue, we will{" "}
        <span className="sw-accent-glow font-semibold">notify affected users</span> as required by law.
      </>
    ),
  },
  {
    id: "rights",
    title: "User Rights",
    body: (
      <>
        Depending on your region, you may request access, correction, export, or deletion of certain personal data.
        Reach out through our official contact channels and we will{" "}
        <span className="sw-accent-glow-pink font-semibold">verify and respond</span> within reasonable timelines.
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const [policyFromApi, setPolicyFromApi] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const publicContent = await contentApi.getPublic();
        setPolicyFromApi((publicContent.privacyPolicy || "").trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load privacy policy");
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
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#AAE847]">Legal</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#EEEDEE] md:text-5xl">
            Privacy{" "}
            <span className="sw-accent-glow-pink" style={{ textShadow: "0 0 26px rgba(234,54,153,0.45)" }}>
              Policy
            </span>
          </h1>

          {loading ? (
            <div className="mt-16 flex justify-start">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-[#AAE847] border-t-transparent"
                aria-label="Loading"
              />
            </div>
          ) : error ? (
            <p className="mt-8 rounded-lg border border-[#EB523F]/40 bg-[#EB523F]/10 px-4 py-3 text-sm text-[#EEEDEE]">
              {error}
            </p>
          ) : (
            <div className="mt-8 max-h-[min(70vh,640px)] space-y-8 overflow-y-auto pr-1 lg:max-h-[calc(100svh-8rem)]">
              {POLICY_SECTIONS.map((s, i) => (
                <section
                  key={s.id}
                  className={`rounded-r-lg border-l-2 pl-5 ${
                    i === 0 ? "border-[#EB523F]/70" : "border-[#EA3699]/40"
                  }`}
                >
                  <h2 className="text-base font-bold tracking-wide text-[#EEEDEE] md:text-lg">{s.title}</h2>
                  <div className="mt-2 text-sm leading-relaxed text-[#E9DFE5]/90 md:text-[0.95rem]">
                    <p>{s.body}</p>
                    {s.id === "intro" && policyFromApi ? (
                      <div className="mt-4 rounded-lg border border-[#EB523F]/25 bg-[#0D0F1A]/80 p-4 text-[#E9DFE5]/95 shadow-[0_0_24px_rgba(235,82,63,0.08)]">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#EB523F]">
                          Published policy
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{policyFromApi}</p>
                      </div>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="sw-legal-animate-right order-2 min-h-[min(52vh,420px)] w-full flex-1 lg:order-none lg:w-[60%] lg:min-h-[calc(100svh-5.25rem)]">
          <LegalSplitVisual variant="privacy" />
        </div>
      </main>
    </div>
  );
}

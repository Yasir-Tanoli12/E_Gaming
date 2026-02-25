"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contentApi } from "@/lib/content-api";

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
    <div className="min-h-screen bg-[#050814] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="CashlySweeps logo"
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-cyan-300/50 shadow-[0_0_22px_rgba(34,211,238,0.3)]"
              />
            ) : (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-xs font-black text-white shadow-[0_0_20px_rgba(217,70,239,0.35)]">
                CS
              </span>
            )}
            <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Legal</p>
            <h1 className="mt-2 text-4xl font-black">Privacy Policy</h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : (
          <article className="rounded-2xl border border-cyan-300/20 bg-[#0a1432]/70 p-6 leading-7 text-cyan-50/90 whitespace-pre-wrap">
            {content}
          </article>
        )}
      </div>
    </div>
  );
}

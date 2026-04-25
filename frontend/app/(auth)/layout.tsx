"use client";

import { usePublicSiteContent } from "@/lib/hooks/use-site-queries";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: siteContent } = usePublicSiteContent();
  const logoUrl = siteContent?.contacts?.logoUrl ?? "";

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="SWEEPSTOWN logo"
              className="h-16 w-16 rounded-full object-cover ring-1 ring-cyan-300/50 shadow-[0_0_32px_rgba(34,211,238,0.35)]"
            />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-lg font-black text-white shadow-[0_0_32px_rgba(217,70,239,0.35)]">
              ST
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

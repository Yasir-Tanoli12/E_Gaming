"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep visibility into client-render failures.
    console.error("App route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-900/80 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-red-300">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-black">We hit a rendering error</h1>
        <p className="mt-3 text-sm text-zinc-300">
          The page crashed while rendering. Try again, or return home.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">Critical error</p>
          <h1 className="mt-2 text-2xl font-black">Application crashed</h1>
          <p className="mt-3 text-sm text-zinc-300">
            A top-level client error occurred. Try reloading this view.
          </p>
          <p className="mt-2 text-xs text-zinc-500">{error?.message ?? "Unknown error"}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
          >
            Reload app
          </button>
        </div>
      </body>
    </html>
  );
}

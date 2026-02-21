"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gamesApi, type Game } from "@/lib/games-api";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/Button";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await gamesApi.list();
        setGames(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role === "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 animate-float rounded-full bg-fuchsia-500/20 blur-[100px]" />
        <div className="absolute right-0 top-40 h-96 w-96 animate-float-delayed rounded-full bg-cyan-400/20 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-cyan-300/20 bg-[#0a1330]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-black tracking-wide text-white">
            E-Gaming
          </Link>
          <nav className="flex items-center gap-4">
            <span className="hidden rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 md:block">
              {user.email}
            </span>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-cyan-300/20 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-cyan-500/20 px-4 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              PLAY. WIN. DOMINATE.
            </h1>
            <p className="mt-4 max-w-xl text-cyan-100/80">
              Neon-styled arcade experience. Hover any game card and hit play.
              Smooth previews, animated effects, and fast launch.
            </p>
          </div>
          <div className="relative h-48 animate-fade-in animation-delay-200 rounded-3xl border border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 p-4 shadow-[0_0_40px_rgba(217,70,239,0.35)]">
            <div className="h-full w-full rounded-2xl border border-cyan-300/30 bg-[#061028]/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Live Lobby
              </p>
              <p className="mt-3 text-2xl font-black text-white">Game Arena</p>
              <p className="mt-2 text-sm text-cyan-100/70">
                Animated cards with video/media previews.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-[#0a1432]/60 p-16 text-center">
            <p className="text-cyan-200/80">No games available yet.</p>
            <p className="mt-2 text-sm text-cyan-100/60">
              Admins can add games from the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, i) => (
              <div
                key={game.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

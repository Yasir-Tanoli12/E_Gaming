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
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            E-Gaming
          </Link>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero section with subtle animation */}
      <section className="relative overflow-hidden border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-white md:text-5xl">
            Play Now
          </h1>
          <p className="mt-3 animate-fade-in animation-delay-200 text-lg text-zinc-400">
            Hover over a game card and click play to start
          </p>
        </div>
      </section>

      {/* Games grid */}
      <main className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-16 text-center">
            <p className="text-zinc-500">No games available yet.</p>
            <p className="mt-2 text-sm text-zinc-600">
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

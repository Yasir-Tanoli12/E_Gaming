"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { gamesApi, type Game } from "@/lib/games-api";
import { contentApi, type SiteContent } from "@/lib/content-api";
import { GameCard } from "@/components/GameCard";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { Button } from "@/components/ui/Button";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showCredentialOptions, setShowCredentialOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [publicContent, data, top] = await Promise.all([
          contentApi.getPublicCached(),
          gamesApi.list(),
          gamesApi.listTop(),
        ]);
        setContent(publicContent);
        setGames(data);
        setTopGames(top);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const topIds = useMemo(() => new Set(topGames.map((g) => g.id)), [topGames]);
  const orderedGames = useMemo(
    () =>
      [...games].sort((a, b) => {
        const aTop = topIds.has(a.id) ? 1 : 0;
        const bTop = topIds.has(b.id) ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }),
    [games, topIds]
  );

  const contacts = content?.contacts;
  const hasCredentialChannels =
    !!contacts?.facebook ||
    !!contacts?.whatsapp ||
    !!contacts?.instagram ||
    !!(contacts?.telegram && contacts.telegram.trim()) ||
    !!contacts?.email?.trim();

  const handleGamePlayRequest = useCallback((clickedGame: Game) => {
    setSelectedGame(clickedGame);
    setShowCredentialOptions(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#1a1a1a]">
      <PublicNavbar />

      <section className="relative overflow-hidden border-b border-[#EDC537]/20 bg-gradient-to-r from-[#990808]/25 via-[#E85D04]/20 to-[#EDC537]/25 px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full bg-[#990808]/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-[#EDC537]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a5a16]">All Games</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">Game Library</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600">
            Browse every game in one place. Top picks are highlighted first.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12">
        {selectedGame && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/95 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#EDC537]/50 bg-white p-6 shadow-[0_0_70px_rgba(237,197,55,0.2)] md:p-8">
              <div className="pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-[#990808]/25 blur-[80px]" />
              <div className="pointer-events-none absolute -right-12 bottom-2 h-56 w-56 rounded-full bg-[#EDC537]/20 blur-[90px]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
                    Game Access
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-zinc-800">{selectedGame.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(null);
                    setShowCredentialOptions(false);
                  }}
                  className="rounded px-2 py-1 text-zinc-600 transition hover:bg-zinc-100"
                >
                  ✕
                </button>
              </div>

              {!showCredentialOptions ? (
                <>
                  <p className="mt-3 text-base text-zinc-700">Where do you want to go?</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        if (selectedGame.gameLink) {
                          window.open(selectedGame.gameLink, "_blank", "noopener,noreferrer");
                        }
                        setSelectedGame(null);
                        setShowCredentialOptions(false);
                      }}
                    >
                      Play Now
                    </Button>
                    <Button variant="secondary" onClick={() => setShowCredentialOptions(true)}>
                      Buy Credentials
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-base text-zinc-700">Contact admin for credentials:</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {hasCredentialChannels ? (
                      <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" />
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Contact channels are not configured yet.
                      </p>
                    )}
                    <Button variant="secondary" onClick={() => setShowCredentialOptions(false)}>
                      Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : orderedGames.length === 0 ? (
          <div className="rounded-xl border border-[#EDC537]/20 bg-[#140808]/70 p-8 text-center text-[#fef3c7]/85">
            No games available yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orderedGames.map((game, i) => (
              <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>
                <GameCard game={game} isTop={topIds.has(game.id)} onPlayRequest={handleGamePlayRequest} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

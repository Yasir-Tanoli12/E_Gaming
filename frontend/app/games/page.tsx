"use client";

import { useCallback, useMemo, useState } from "react";
import type { Game } from "@/lib/games-api";
import {
  useGamesList,
  useGamesTop,
  usePublicSiteContent,
} from "@/lib/hooks/use-site-queries";
import { GameCard } from "@/components/GameCard";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { Button } from "@/components/ui/Button";

export default function GamesPage() {
  const contentQuery = usePublicSiteContent();
  const gamesQuery = useGamesList();
  const topGamesQuery = useGamesTop();

  const content = contentQuery.data ?? null;
  const games = gamesQuery.data ?? [];
  const topGames = topGamesQuery.data ?? [];

  const loading =
    contentQuery.isPending || gamesQuery.isPending || topGamesQuery.isPending;
  const firstError = contentQuery.error || gamesQuery.error || topGamesQuery.error;
  const error =
    firstError instanceof Error
      ? firstError.message
      : firstError
        ? String(firstError)
        : "";

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showCredentialOptions, setShowCredentialOptions] = useState(false);

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
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[#E9DFE5] text-[#161015]">
      <PublicNavbar />

      <section className="relative w-full min-w-0 max-w-full overflow-x-clip border-b-[3px] border-[#161015] bg-gradient-to-r from-[#EB523F]/22 via-[#EA3699]/18 to-[#AAE847]/22 py-12 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
        <div className="pointer-events-none absolute inset-0 min-w-0">
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full bg-[#EB523F]/28 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-[#AAE847]/25 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full min-w-0 max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EB523F]">All Games</p>
          <h1 className="sw-text-wobble mt-2 text-4xl font-black text-[#161015] md:text-5xl">Game Library</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600">
            Browse every game in one place. Top picks are highlighted first.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full min-w-0 max-w-7xl px-[max(1rem,env(safe-area-inset-left))] py-12 pe-[max(1rem,env(safe-area-inset-right))]">
        {selectedGame && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/95 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-[3px] border-[#161015] bg-[#EEEDEE] p-6 shadow-[8px_10px_0_#161015,0_0_0_3px_#AAE847] md:p-8">
              <div className="pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-[#EB523F]/25 blur-[80px]" />
              <div className="pointer-events-none absolute -right-12 bottom-2 h-56 w-56 rounded-full bg-[#EA3699]/22 blur-[90px]" />
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
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EB523F] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : orderedGames.length === 0 ? (
          <div className="rounded-xl border-[3px] border-[#161015] bg-[#161015]/92 p-8 text-center text-[#EEEDEE]/90 shadow-[6px_8px_0_#EB523F]">
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

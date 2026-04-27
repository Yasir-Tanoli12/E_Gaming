"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Game } from "@/lib/games-api";
import {
  useGamesList,
  useGamesTop,
  useNewsCurrent,
  usePublicSiteContent,
} from "@/lib/hooks/use-site-queries";
import { resolveUploadMediaUrl } from "@/lib/media-url";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/Button";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { InteractiveReviewCarousel } from "@/components/InteractiveReviewCarousel";
import { BrandTextureBackdrop } from "@/components/legal/BrandTextureBackdrop";
import { readLobbySoundAllowed, writeLobbySoundAllowed } from "@/lib/lobby-audio-storage";

export default function UserDashboardPage() {
  const contentQuery = usePublicSiteContent();
  const gamesQuery = useGamesList();
  const topGamesQuery = useGamesTop();
  const newsQuery = useNewsCurrent();

  const content = contentQuery.data ?? null;
  const games = gamesQuery.data ?? [];
  const topGames = topGamesQuery.data ?? [];
  const newsPoster = newsQuery.data ?? null;

  const loading =
    contentQuery.isPending ||
    gamesQuery.isPending ||
    topGamesQuery.isPending ||
    newsQuery.isPending;

  const firstError =
    contentQuery.error ||
    gamesQuery.error ||
    topGamesQuery.error ||
    newsQuery.error;
  const error =
    firstError instanceof Error
      ? firstError.message
      : firstError
        ? String(firstError)
        : "";

  const [showNews, setShowNews] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [ageWarningReady, setAgeWarningReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showCredentialOptions, setShowCredentialOptions] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroVideoBlocked, setHeroVideoBlocked] = useState(false);

  /** Open /dashboard#games (etc.) from other pages — scroll target after layout. */
  useEffect(() => {
    const run = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const id = raw.startsWith("#") ? decodeURIComponent(raw.slice(1)) : "";
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  useEffect(() => {
    if (!contentQuery.isSuccess || !content) return;
    setAgeWarningReady(true);
    setShowAgeWarning(!readLobbySoundAllowed());
  }, [contentQuery.isSuccess, content]);

  useEffect(() => {
    if (!contentQuery.isError) return;
    setAgeWarningReady(true);
    setShowAgeWarning(!readLobbySoundAllowed());
  }, [contentQuery.isError]);

  useEffect(() => {
    if (!newsPoster || typeof window === "undefined") return;
    const seenKey = newsPoster.id ? `news_seen_${newsPoster.id}` : null;
    if (seenKey && !sessionStorage.getItem(seenKey)) {
      setShowNews(true);
      sessionStorage.setItem(seenKey, "1");
    }
  }, [newsPoster]);

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
  const heroVideo =
    resolveUploadMediaUrl(contacts?.lobbyVideoUrl ?? null) ??
    orderedGames
      .map((game) => resolveUploadMediaUrl(game.videoUrl))
      .find((u) => !!u) ??
    null;
  const reviewItems = content?.reviews ?? [];
  const ageWarning = content?.ageWarning ?? {
    title: "18+ Content Notice",
    message:
      "This gaming website may include mature themes. Enter only if you are 18 years old or above.",
    enterButtonLabel: "I am 18+ Enter",
    exitButtonLabel: "Exit",
    exitUrl: "https://www.google.com",
  };

  const handleGamePlayRequest = useCallback((clickedGame: Game) => {
    setSelectedGame(clickedGame);
    setShowCredentialOptions(false);
  }, []);

  useEffect(() => {
    setHeroVideoBlocked(false);
    const video = heroVideoRef.current;
    if (!video || !heroVideo) return;

    const tryPlay = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.play().then(() => setHeroVideoBlocked(false)).catch(() => setHeroVideoBlocked(true));
    };

    tryPlay();
    const onCanPlay = () => tryPlay();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tryPlay();
      }
    };

    video.addEventListener("canplay", onCanPlay);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [heroVideo]);

  return (
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-clip text-[#161015]">
      <BrandTextureBackdrop className="fixed inset-0 z-0" />

      <section
        id="home"
        className="relative z-[1] isolate flex min-h-[100dvh] w-full min-w-0 max-w-full scroll-mt-24 flex-col overflow-x-hidden border-b border-[#EB523F]/30"
      >
        {/* Full-bleed lobby video (fills entire hero, including behind navbar) */}
        <div className="absolute inset-0 z-0 min-h-full w-full bg-[#161015]">
          {heroVideo ? (
            <video
              ref={heroVideoRef}
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(235,82,63,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(170,232,71,0.32),transparent_45%),linear-gradient(145deg,#1a0a12,#161015,#2a0f1c)]">
              <p className="text-sm text-[#EEEDEE]/70">Game preview will appear here</p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_48%,rgba(5,8,20,0.2)_50%,transparent_52%)] bg-[length:100%_6px] opacity-25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161015]/90 via-[#161015]/45 to-[#161015]/25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#161015]/75 via-transparent to-[#EB523F]/15" />
          {heroVideo && heroVideoBlocked ? (
            <button
              type="button"
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-sm font-semibold text-white backdrop-blur-[2px]"
              onClick={() => {
                const video = heroVideoRef.current;
                if (!video) return;
                video.defaultMuted = true;
                video.muted = true;
                video.play().then(() => setHeroVideoBlocked(false)).catch(() => {});
              }}
            >
              Tap to play lobby video
            </button>
          ) : null}
        </div>

        <div className="relative z-50 shrink-0">
          <PublicNavbar variant="overlay" />
        </div>

        <div className="relative z-[1] mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col justify-end px-[max(1rem,env(safe-area-inset-left))] pb-12 pt-2 pr-[max(1rem,env(safe-area-inset-right))] min-h-0 sm:justify-center sm:pb-20 sm:pt-4">
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border-2 border-[#161015] bg-[#AAE847]/90 px-3 py-1 text-xs font-bold text-[#161015] shadow-[3px_3px_0_#161015]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#EB523F]" />
            LIVE LOBBY
          </div>
          <div className="min-w-0 max-w-full animate-fade-in sm:max-w-2xl lg:max-w-3xl">
            <h1 className="sw-text-wobble break-words text-4xl font-black leading-[0.95] text-[#EEEDEE] drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-5xl md:text-7xl">
              PLAY. WIN. DOMINATE.
            </h1>
            <p className="mt-6 max-w-xl text-base text-[#EEEDEE]/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg">
              Browse our curated games. Play instantly with your credentials or
              get access from our support team. Click any game card to play or buy credentials.
            </p>
          </div>
        </div>
      </section>

      <main
        id="games"
        className="relative z-10 mx-auto w-full min-w-0 max-w-7xl scroll-mt-24 px-[max(1rem,env(safe-area-inset-left))] py-12 pr-[max(1rem,env(safe-area-inset-right))]"
      >
        {showAgeWarning && ageWarningReady && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-2xl border border-amber-400/50 bg-white p-6 text-center shadow-[0_0_60px_rgba(251,191,36,0.25)]">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Warning</p>
              <h3 className="mt-2 text-2xl font-black text-zinc-800">{ageWarning.title}</h3>
              <p className="mt-3 text-sm text-zinc-600">
                {ageWarning.message}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    writeLobbySoundAllowed();
                    setShowAgeWarning(false);
                  }}
                >
                  {ageWarning.enterButtonLabel}
                </Button>
                <a
                  href={ageWarning.exitUrl || "https://www.google.com"}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 px-4 py-2.5 text-sm text-zinc-700 transition hover:bg-amber-50"
                >
                  {ageWarning.exitButtonLabel}
                </a>
              </div>
            </div>
          </div>
        )}

        {showNews && newsPoster && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#161015]/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[min(92dvh,100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-[3px] border-[#161015] bg-[#EEEDEE] shadow-[6px_8px_0_#161015,0_0_0_3px_#EA3699]">
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
                <h3 className="font-semibold text-zinc-800">{newsPoster.title ?? "Latest News"}</h3>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-zinc-600 hover:bg-amber-50"
                  onClick={() => setShowNews(false)}
                >
                  ✕
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <img
                  src={resolveUploadMediaUrl(newsPoster.imageUrl) ?? ""}
                  alt={newsPoster.title ?? "News"}
                  className="block w-full max-w-full object-contain object-top"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        )}

        {selectedGame && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/95 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-[3px] border-[#161015] bg-[#EEEDEE] p-6 shadow-[8px_10px_0_#161015,0_0_0_3px_#AAE847] md:p-8">
              <div className="pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-[#EB523F]/25 blur-[80px]" />
              <div className="pointer-events-none absolute -right-12 bottom-2 h-56 w-56 rounded-full bg-[#EA3699]/22 blur-[90px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(170,232,71,0.2),transparent_45%)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
                    Game Access
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-zinc-800">
                    {selectedGame.title}
                  </h3>
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
                  <p className="mt-3 text-base text-zinc-700">
                    Where do you want to go?
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        if (selectedGame.gameLink) {
                          window.open(
                            selectedGame.gameLink,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                        setSelectedGame(null);
                        setShowCredentialOptions(false);
                      }}
                    >
                      Play Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowCredentialOptions(true)}
                    >
                      Buy Credentials
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-base text-zinc-700">
                    Contact admin for credentials:
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {hasCredentialChannels ? (
                      <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" />
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Add Facebook, WhatsApp, Instagram, Telegram, or support email in Admin →
                        Contacts.
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setShowCredentialOptions(false)}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#EB523F] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border-[3px] border-[#161015] bg-[#161015]/90 p-16 text-center shadow-[6px_8px_0_#EB523F]">
            <p className="text-[#EEEDEE]/95">No games available yet.</p>
            <p className="mt-2 text-sm text-[#EEEDEE]/75">
              Admins can add games from the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="min-w-0 space-y-12">
            <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orderedGames.map((game, i) => (
                <div
                  key={game.id}
                  className="game-card-appear min-w-0 max-w-full"
                  style={
                    { "--game-card-stagger": `${Math.min(i * 70, 280)}ms` } as CSSProperties
                  }
                >
                  <GameCard
                    game={game}
                    isTop={topIds.has(game.id)}
                    onPlayRequest={handleGamePlayRequest}
                  />
                </div>
              ))}
            </div>

            <section
              id="reviews"
              className="overflow-visible rounded-3xl border-[3px] border-[#161015] bg-[radial-gradient(ellipse_85%_55%_at_15%_0%,rgba(235,82,63,0.16),transparent_55%),radial-gradient(ellipse_70%_50%_at_92%_100%,rgba(234,54,153,0.14),transparent_50%),linear-gradient(165deg,#D9D0D6_0%,#E9DFE5_48%,#E0D5DC_100%)] px-2 py-6 shadow-[8px_10px_0_#161015] sm:px-5 sm:py-8"
            >
              <div className="mb-1 flex flex-col gap-0.5 sm:mb-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="sw-text-wobble text-2xl font-black text-[#161015] md:text-3xl">
                  Player hype
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EA3699] sm:text-xs">
                  What players are saying
                </span>
              </div>
              {reviewItems.length === 0 ? (
                <div className="rounded-xl border-[3px] border-dashed border-[#EB523F]/60 bg-[#E9DFE5] p-6 text-sm font-semibold text-[#161015]">
                  No reviews added yet.
                </div>
              ) : (
                <InteractiveReviewCarousel reviews={reviewItems} />
              )}
            </section>

          </div>
        )}
      </main>

    </div>
  );
}

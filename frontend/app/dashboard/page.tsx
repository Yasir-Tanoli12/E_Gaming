"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gamesApi, type Game } from "@/lib/games-api";
import { newsApi, type NewsPoster } from "@/lib/news-api";
import { contentApi, type SiteContent } from "@/lib/content-api";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/Button";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function UserDashboardPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [newsPoster, setNewsPoster] = useState<NewsPoster | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [ageWarningReady, setAgeWarningReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showCredentialOptions, setShowCredentialOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Load content first so the first 18+ popup already uses admin text.
        const publicContent = await contentApi.getPublic();
        setContent(publicContent);
        setAgeWarningReady(true);
        setShowAgeWarning(true);

        // Keep the rest sequential to avoid saturating low DB pool limits.
        const data = await gamesApi.list();
        const top = await gamesApi.listTop();
        const poster = await newsApi.current();
        setGames(data);
        setTopGames(top);
        setNewsPoster(poster);
        const seenKey = poster?.id ? `news_seen_${poster.id}` : null;
        if (poster && seenKey && !localStorage.getItem(seenKey)) {
          setShowNews(true);
          localStorage.setItem(seenKey, "1");
        }
      } catch (err) {
        setAgeWarningReady(true);
        setShowAgeWarning(true);
        setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topIds = new Set(topGames.map((g) => g.id));
  const orderedGames = [...games].sort((a, b) => {
    const aTop = topIds.has(a.id) ? 1 : 0;
    const bTop = topIds.has(b.id) ? 1 : 0;
    if (aTop !== bTop) return bTop - aTop;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
  const contacts = content?.contacts;
  const logoUrl = contacts?.logoUrl ?? "";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const privacyPolicyPdfUrl =
    `${apiBaseUrl}/content/documents/privacy-policy`;
  const socialResponsibilityPdfUrl =
    `${apiBaseUrl}/content/documents/social-responsibility`;
  const whatsappLink = contacts?.whatsapp
    ? contacts.whatsapp.startsWith("http")
      ? contacts.whatsapp
      : `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`
    : "";
  const heroVideo =
    contacts?.lobbyVideoUrl ??
    orderedGames.find((game) => game.videoUrl)?.videoUrl ??
    null;
  const reviewItems = content?.reviews ?? [];
  const movingReviewItems = reviewItems.length > 0 ? [...reviewItems, ...reviewItems] : [];
  const ageWarning = content?.ageWarning ?? {
    title: "18+ Content Notice",
    message:
      "This gaming website may include mature themes. Enter only if you are 18 years old or above.",
    enterButtonLabel: "I am 18+ Enter",
    exitButtonLabel: "Exit",
    exitUrl: "https://www.google.com",
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 animate-float rounded-full bg-fuchsia-500/20 blur-[100px]" />
        <div className="absolute right-0 top-40 h-96 w-96 animate-float-delayed rounded-full bg-cyan-400/20 blur-[110px]" />
      </div>

      <PublicNavbar />

      <section
        id="home"
        className="relative flex min-h-[calc(100vh-82px)] items-center overflow-hidden border-b border-cyan-300/20 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-cyan-500/20 px-4 py-10"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-52 w-52 animate-pulse rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
              PLAY. WIN. DOMINATE.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cyan-100/80">
              Browse our curated games. Play instantly with your credentials or
              get access from our support team. Click any game card to play or buy credentials.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-cyan-200">
                Game previews
              </span>
              <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-200">
                Get credentials
              </span>
            </div>
          </div>
          <div className="relative h-[420px] animate-fade-in animation-delay-200 rounded-3xl border border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 p-3 shadow-[0_0_45px_rgba(217,70,239,0.35)] md:h-[500px]">
            <div className="absolute -inset-[1px] -z-10 rounded-3xl bg-[conic-gradient(from_0deg,rgba(34,211,238,0.45),rgba(217,70,239,0.45),rgba(34,211,238,0.45))] blur-sm" />
            <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#061028]/80">
              {heroVideo ? (
                <video
                  src={heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.35),transparent_40%),linear-gradient(120deg,#0a1230,#131a46)]">
                  <p className="text-sm text-cyan-100/75">Game preview will appear here</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_48%,rgba(5,8,20,0.25)_50%,transparent_52%)] bg-[length:100%_6px] opacity-30" />
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                LIVE LOBBY
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/45 px-4 py-2 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Game Arena</p>
                <p className="mt-1 text-sm text-cyan-100/85">Browse games, get credentials, or play now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="games" className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {showAgeWarning && ageWarningReady && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-amber-400/40 bg-[#120f06] p-6 text-center shadow-[0_0_60px_rgba(251,191,36,0.2)]">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Warning</p>
              <h3 className="mt-2 text-2xl font-black text-amber-100">{ageWarning.title}</h3>
              <p className="mt-3 text-sm text-amber-100/80">
                {ageWarning.message}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button onClick={() => setShowAgeWarning(false)}>
                  {ageWarning.enterButtonLabel}
                </Button>
                <a
                  href={ageWarning.exitUrl || "https://www.google.com"}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  {ageWarning.exitButtonLabel}
                </a>
              </div>
            </div>
          </div>
        )}

        {showNews && newsPoster && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-fuchsia-400/40 bg-[#0c1230] shadow-[0_0_60px_rgba(217,70,239,0.3)]">
              <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
                <h3 className="font-semibold text-white">{newsPoster.title ?? "Latest News"}</h3>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-zinc-300 hover:bg-zinc-700"
                  onClick={() => setShowNews(false)}
                >
                  ✕
                </button>
              </div>
              <img src={newsPoster.imageUrl} alt={newsPoster.title ?? "News"} className="max-h-[70vh] w-full object-cover" />
            </div>
          </div>
        )}

        {selectedGame && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-300/40 bg-[#0b0904]/95 p-6 shadow-[0_0_70px_rgba(251,191,36,0.2)] md:p-8">
              <div className="pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-[80px]" />
              <div className="pointer-events-none absolute -right-12 bottom-2 h-56 w-56 rounded-full bg-cyan-400/20 blur-[90px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_45%)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                    Game Access
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    {selectedGame.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(null);
                    setShowCredentialOptions(false);
                  }}
                  className="rounded px-2 py-1 text-zinc-300 transition hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {!showCredentialOptions ? (
                <>
                  <p className="mt-3 text-base text-amber-100/85">
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
                  <p className="mt-3 text-base text-amber-100/85">
                    Contact admin for credentials:
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={contacts?.facebook || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Messenger"
                      title="Messenger"
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${
                        contacts?.facebook
                          ? "border border-fuchsia-300/50 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.35)] hover:-translate-y-0.5 hover:bg-fuchsia-500/30"
                          : "pointer-events-none border border-zinc-700 bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.46 5.52 3.74 7.22V22l3.35-1.84c.9.25 1.88.38 2.91.38 5.52 0 10-4.15 10-9.27S17.52 2 12 2zm.99 12.5-2.55-2.72-4.9 2.72 5.39-5.73 2.63 2.72 4.82-2.72-5.39 5.73z" />
                      </svg>
                    </a>
                    <a
                      href={whatsappLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${
                        whatsappLink
                          ? "border border-emerald-300/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_22px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 hover:bg-emerald-500/30"
                          : "pointer-events-none border border-zinc-700 bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.54 0 .2 5.34.2 11.86c0 2.09.55 4.14 1.59 5.95L0 24l6.37-1.67a11.86 11.86 0 0 0 5.7 1.46h.01c6.53 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.43-8.45zM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.91-9.88a9.8 9.8 0 0 1 7.02 2.91 9.79 9.79 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.91 9.89zm5.43-7.42c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.33.2 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
                      </svg>
                    </a>
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
          <div className="space-y-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orderedGames.map((game, i) => (
                <div
                  key={game.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <GameCard
                    game={game}
                    isTop={topIds.has(game.id)}
                    onPlayRequest={(clickedGame) => {
                      setSelectedGame(clickedGame);
                      setShowCredentialOptions(false);
                    }}
                  />
                </div>
              ))}
            </div>

            <section id="reviews">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black">Reviews</h2>
                <span className="text-xs text-cyan-200/70">What players are saying</span>
              </div>
              {reviewItems.length === 0 ? (
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-5 text-sm text-zinc-400">
                  No reviews added yet.
                </div>
              ) : (
                <div className="qa-marquee-shell">
                  <div className="qa-marquee-glow" />
                  <div className="qa-marquee-track">
                    {movingReviewItems.map((item, index) => (
                      <article
                        key={`${item.id}-${index}`}
                        className="qa-marquee-card"
                      >
                        <p className="text-sm font-bold tracking-wide text-white">
                          {item.reviewer}
                        </p>
                        <p className="mt-2 text-sm italic text-cyan-100/85">{item.message}</p>
                        <p className="mt-2 text-xs text-amber-300/90">Rating: {item.rating}/5</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      <footer className="relative mt-8 border-t border-cyan-300/20 bg-[#070d22]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-40 w-40 animate-orbit rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-44 w-44 animate-orbit-reverse rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="CashlySweeps logo"
                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-cyan-300/50 shadow-[0_0_24px_rgba(34,211,238,0.3)]"
                  />
                ) : (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-sm font-black text-white shadow-[0_0_20px_rgba(217,70,239,0.35)]">
                    CS
                  </span>
                )}
                <h3 className="text-xl font-black text-white">CashlySweeps</h3>
              </div>
              <p className="mt-3 text-sm text-cyan-100/70">
                Play trending games with credentials. Get access from our support team or jump in straight away.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Quick Links</p>
              <div className="mt-3 space-y-2 text-sm">
                <a href="#games" className="block text-cyan-100/70 transition hover:text-white">Games</a>
                <Link href="/about-us" className="block text-cyan-100/70 transition hover:text-white">About Us</Link>
                <Link href="/blogs" className="block text-cyan-100/70 transition hover:text-white">Blogs</Link>
                <Link href="/privacy-policy" className="block text-cyan-100/70 transition hover:text-white">Guidelines</Link>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">Resources</p>
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href={privacyPolicyPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-cyan-100/70 transition hover:text-white"
                >
                  Privacy Policy
                </a>
                <a
                  href={socialResponsibilityPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-cyan-100/70 transition hover:text-white"
                >
                  Social Responsibility Rules
                </a>
              </div>
            </div>

            <div id="support">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-cyan-100/70">
                <p>{contacts?.email || "moeeedahmed07@gmail.com"}</p>
                <p>24/7 Live Support</p>
                <div className="mt-1 flex gap-2">
                  {contacts?.facebook && (
                    <a
                      href={contacts.facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      title="Facebook"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 text-fuchsia-200 shadow-[0_0_16px_rgba(217,70,239,0.32)] transition hover:-translate-y-0.5 hover:bg-fuchsia-500/25"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.79-3.88 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.89h-2.35v6.99A10 10 0 0 0 22 12z" />
                      </svg>
                    </a>
                  )}
                  {contacts?.whatsapp && (
                    <a
                      href={contacts.whatsapp.startsWith("http") ? contacts.whatsapp : `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/15 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.32)] transition hover:-translate-y-0.5 hover:bg-emerald-500/25"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.54 0 .2 5.34.2 11.86c0 2.09.55 4.14 1.59 5.95L0 24l6.37-1.67a11.86 11.86 0 0 0 5.7 1.46h.01c6.53 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.43-8.45zM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.91-9.88a9.8 9.8 0 0 1 7.02 2.91 9.79 9.79 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.91 9.89zm5.43-7.42c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.33.2 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-cyan-300/20 pt-4 text-xs text-cyan-100/60 md:flex-row">
            <p>© {new Date().getFullYear()} CashlySweeps. All rights reserved.</p>
            <p>Built for players who love to play.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

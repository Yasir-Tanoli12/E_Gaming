"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gamesApi, type Game } from "@/lib/games-api";
import { newsApi, type NewsPoster } from "@/lib/news-api";
import { contentApi, type SiteContent } from "@/lib/content-api";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/Button";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [newsPoster, setNewsPoster] = useState<NewsPoster | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(true);
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
        const [data, top, poster, publicContent] = await Promise.all([
          gamesApi.list(),
          gamesApi.listTop(),
          newsApi.current(),
          contentApi.getPublic(),
        ]);
        setGames(data);
        setTopGames(top);
        setNewsPoster(poster);
        setContent(publicContent);
        const seenKey = poster?.id ? `news_seen_${poster.id}` : null;
        if (poster && seenKey && !localStorage.getItem(seenKey)) {
          setShowNews(true);
          localStorage.setItem(seenKey, "1");
        }
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

  const topIds = new Set(topGames.map((g) => g.id));
  const orderedGames = [...games].sort((a, b) => {
    const aTop = topIds.has(a.id) ? 1 : 0;
    const bTop = topIds.has(b.id) ? 1 : 0;
    if (aTop !== bTop) return bTop - aTop;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
  const contacts = content?.contacts;
  const heroVideo = orderedGames.find((game) => game.videoUrl)?.videoUrl ?? null;
  const faqItems = content?.faqs ?? [];
  const movingFaqItems = faqItems.length > 0 ? [...faqItems, ...faqItems] : [];

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 animate-float rounded-full bg-fuchsia-500/20 blur-[100px]" />
        <div className="absolute right-0 top-40 h-96 w-96 animate-float-delayed rounded-full bg-cyan-400/20 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-cyan-300/20 bg-[#0a1330]/80 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/80 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="group relative text-xl font-black tracking-wide text-white">
            <span className="absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r from-fuchsia-500/30 to-cyan-400/30 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
            <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
              E-Gaming
            </span>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {[
              { label: "Lobby", href: "/dashboard", active: true },
              { label: "Games", href: "#games" },
              { label: "Blogs", href: "/blogs" },
              { label: "Q/A", href: "#qa" },
              { label: "Support", href: "#support" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  item.active
                    ? "bg-gradient-to-r from-fuchsia-500/85 via-violet-500/80 to-cyan-400/85 text-white shadow-[0_0_28px_rgba(34,211,238,0.45)]"
                    : "text-cyan-100/80 hover:-translate-y-0.5 hover:scale-[1.03] hover:text-white"
                }`}
              >
                {!item.active && (
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/25 to-cyan-400/0 opacity-0 transition duration-300 group-hover:opacity-100" />
                )}
                {!item.active && (
                  <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-fuchsia-400 to-cyan-300 transition-all duration-300 group-hover:w-3/4" />
                )}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {contacts?.facebook && (
              <a
                href={contacts.facebook}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200 transition hover:bg-fuchsia-500/20 md:inline-block"
              >
                Facebook
              </a>
            )}
            {contacts?.whatsapp && (
              <a
                href={contacts.whatsapp.startsWith("http") ? contacts.whatsapp : `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/20 md:inline-block"
              >
                WhatsApp
              </a>
            )}
            <span className="hidden rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 md:block">
              {user.email}
            </span>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[calc(100vh-82px)] items-center overflow-hidden border-b border-cyan-300/20 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-cyan-500/20 px-4 py-10">
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
              Neon-styled arcade experience. Hover any game card and hit play.
              Smooth previews, animated effects, and fast launch.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-cyan-200">
                Real-time previews
              </span>
              <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-200">
                Animated UI
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
                  <p className="text-sm text-cyan-100/75">Add a game video to animate this hero</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_48%,rgba(5,8,20,0.25)_50%,transparent_52%)] bg-[length:100%_6px] opacity-30" />
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                LIVE LOBBY
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/45 px-4 py-2 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Game Arena</p>
                <p className="mt-1 text-sm text-cyan-100/85">High energy gameplay preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="games" className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {showAgeWarning && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-amber-400/40 bg-[#120f06] p-6 text-center shadow-[0_0_60px_rgba(251,191,36,0.2)]">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Warning</p>
              <h3 className="mt-2 text-2xl font-black text-amber-100">18+ Content Notice</h3>
              <p className="mt-3 text-sm text-amber-100/80">
                This gaming website may include mature themes. Enter only if you
                are 18 years old or above.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button onClick={() => setShowAgeWarning(false)}>I am 18+ Enter</Button>
                <a
                  href="https://www.google.com"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  Exit
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
              {newsPoster.linkUrl ? (
                <a href={newsPoster.linkUrl} target="_blank" rel="noopener noreferrer">
                  <img src={newsPoster.imageUrl} alt={newsPoster.title ?? "News"} className="max-h-[70vh] w-full object-cover" />
                </a>
              ) : (
                <img src={newsPoster.imageUrl} alt={newsPoster.title ?? "News"} className="max-h-[70vh] w-full object-cover" />
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
                  <GameCard game={game} isTop={topIds.has(game.id)} />
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-cyan-300/20 bg-[#0a1432]/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Blogs</h2>
                  <p className="mt-1 text-sm text-cyan-100/70">
                    Read all updates and posts on the separate blogs page.
                  </p>
                </div>
                <Link
                  href="/blogs"
                  className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                >
                  Open Blogs Page
                </Link>
              </div>
            </section>

            <section id="qa">
              <h2 className="mb-4 text-2xl font-black">Q/A</h2>
              {faqItems.length === 0 ? (
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-5 text-sm text-zinc-400">
                  No questions added yet.
                </div>
              ) : (
                <div className="qa-marquee-container rounded-2xl border border-fuchsia-300/20 bg-[#0f1230]/70 py-4">
                  <div className="qa-marquee-track">
                    {movingFaqItems.map((item, index) => (
                      <article
                        key={`${item.id}-${index}`}
                        className="qa-marquee-card"
                      >
                        <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-100">
                          {item.question}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">{item.answer}</p>
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
              <h3 className="text-xl font-black text-white">E-Gaming</h3>
              <p className="mt-3 text-sm text-cyan-100/70">
                Play trending games with a neon arcade experience and smooth media previews.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Quick Links</p>
              <div className="mt-3 space-y-2 text-sm">
                <a href="#games" className="block text-cyan-100/70 transition hover:text-white">Games</a>
                <Link href="/blogs" className="block text-cyan-100/70 transition hover:text-white">Blogs</Link>
                <a href="#leaderboard" className="block text-cyan-100/70 transition hover:text-white">Leaderboard</a>
                <a href="#rewards" className="block text-cyan-100/70 transition hover:text-white">Rewards</a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">Resources</p>
              <div className="mt-3 space-y-2 text-sm">
                <a href="#" className="block text-cyan-100/70 transition hover:text-white">Help Center</a>
                <a href="#" className="block text-cyan-100/70 transition hover:text-white">Terms</a>
                <a href="#" className="block text-cyan-100/70 transition hover:text-white">Privacy</a>
              </div>
            </div>

            <div id="support">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-cyan-100/70">
                <p>{contacts?.email || "support@egaming.com"}</p>
                <p>{contacts?.whatsapp || "+92 300 0000000"}</p>
                <p>24/7 Live Support</p>
                <div className="mt-1 flex gap-2">
                  {contacts?.facebook && (
                    <a href={contacts.facebook} target="_blank" rel="noreferrer" className="text-fuchsia-300 hover:text-fuchsia-200">
                      Facebook
                    </a>
                  )}
                  {contacts?.whatsapp && (
                    <a
                      href={contacts.whatsapp.startsWith("http") ? contacts.whatsapp : `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-cyan-300/20 pt-4 text-xs text-cyan-100/60 md:flex-row">
            <p>© {new Date().getFullYear()} E-Gaming. All rights reserved.</p>
            <p>Built for immersive gaming UX.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

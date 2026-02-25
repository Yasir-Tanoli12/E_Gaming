"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { contentApi, type SiteContent } from "@/lib/content-api";

export default function BlogsPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await contentApi.getPublic();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const blogs = content?.blogs ?? [];
  const logoUrl = content?.contacts?.logoUrl ?? "";
  const [featuredBlog, ...otherBlogs] = blogs;
  const sideBlogs = otherBlogs.slice(0, 3);
  const remainingBlogs = otherBlogs.slice(3);

  return (
    <div className="blog-radiant-page min-h-screen px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="blog-radiant-orb blog-radiant-orb-left" />
        <div className="blog-radiant-orb blog-radiant-orb-right" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="CashlySweeps logo"
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-cyan-300/50 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-sm font-black text-white shadow-[0_0_24px_rgba(217,70,239,0.35)]">
                CS
              </span>
            )}
            <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Neon Editorial</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Blogs</h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-100/70">
              Fresh posts, updates, and stories with a glowing CashlySweeps vibe.
            </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/25 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-5 text-sm text-zinc-400">
            No blogs published yet.
          </div>
        ) : (
          <div className="space-y-8">
            {featuredBlog && (
              <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
                <article className="blog-feature-card group">
                  <div className="relative overflow-hidden rounded-2xl">
                    {featuredBlog.imageUrl ? (
                      <img
                        src={featuredBlog.imageUrl}
                        alt={featuredBlog.title}
                        className="blog-feature-image h-[290px] w-full object-cover md:h-[360px]"
                      />
                    ) : (
                      <div className="h-[290px] w-full bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.35),transparent_38%),linear-gradient(120deg,#0b1331,#121f47)] md:h-[360px]" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/35 to-transparent" />
                  </div>
                  <div className="relative z-10 mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/90">Featured Story</p>
                    <h2 className="mt-2 text-2xl font-black md:text-3xl">{featuredBlog.title}</h2>
                    {featuredBlog.excerpt && (
                      <p className="mt-2 text-sm text-cyan-100/80">{featuredBlog.excerpt}</p>
                    )}
                    {featuredBlog.content && (
                      <p className="mt-3 line-clamp-4 text-sm text-zinc-300">{featuredBlog.content}</p>
                    )}
                  </div>
                </article>

                <div className="space-y-4">
                  {sideBlogs.map((blog) => (
                    <article key={blog.id} className="blog-side-card group">
                      <div className="flex gap-3">
                        <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                          {blog.imageUrl ? (
                            <img
                              src={blog.imageUrl}
                              alt={blog.title}
                              className="blog-thumb-image h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[linear-gradient(135deg,#6d28d9,#0891b2)] opacity-70" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold">{blog.title}</h3>
                          {blog.excerpt && (
                            <p className="mt-1 line-clamp-2 text-xs text-cyan-100/75">{blog.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {remainingBlogs.length > 0 && (
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {remainingBlogs.map((blog) => (
                  <article key={blog.id} className="blog-grid-card group">
                    <div className="overflow-hidden rounded-xl">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="blog-thumb-image h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="h-44 w-full bg-[radial-gradient(circle_at_10%_20%,rgba(217,70,239,0.35),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.35),transparent_38%),#0f1a3a]" />
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-bold">{blog.title}</h3>
                    {blog.excerpt && (
                      <p className="mt-1 text-sm text-cyan-100/75">{blog.excerpt}</p>
                    )}
                    {blog.content && (
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-300">{blog.content}</p>
                    )}
                  </article>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

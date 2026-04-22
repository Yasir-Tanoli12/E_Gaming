"use client";

import { useEffect, useMemo, useState } from "react";
import { contentApi, type SiteContent } from "@/lib/content-api";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function BlogsPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
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

  const blogs = useMemo(() => content?.blogs ?? [], [content?.blogs]);
  const logoUrl = content?.contacts?.logoUrl ?? "";

  useEffect(() => {
    if (blogs.length === 0) {
      setSelectedBlogId(null);
      return;
    }
    const exists = blogs.some((blog) => blog.id === selectedBlogId);
    if (!selectedBlogId || !exists) {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  const selectedBlog =
    blogs.find((blog) => blog.id === selectedBlogId) ?? blogs[0] ?? null;
  const listBlogs = blogs.filter((blog) => blog.id !== selectedBlog?.id);

  return (
    <div className="blog-radiant-page min-h-screen text-[#2a1808]">
      <PublicNavbar />
      <div className="px-4 py-10">
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
                alt="SWEEPSTOWN logo"
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[#EDC537]/50 shadow-[0_0_24px_rgba(237,197,55,0.35)]"
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#990808] to-[#EDC537] text-sm font-black text-white shadow-[0_0_24px_rgba(237,197,55,0.35)]">
                ST
              </span>
            )}
            <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9a7000]">Neon Editorial</p>
            <h1 className="mt-2 text-4xl font-black text-[#7a0b0b] md:text-5xl">Blogs</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5b3b18]">
              Fresh posts, updates, and stories with a glowing SWEEPSTOWN vibe.
            </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
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
          <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
            {selectedBlog && (
              <article key={selectedBlog.id} className="blog-feature-card group">
                <div className="relative overflow-hidden rounded-2xl">
                  {selectedBlog.imageUrl ? (
                    <img
                      src={selectedBlog.imageUrl}
                      alt={selectedBlog.title}
                      className="blog-feature-image h-[290px] w-full object-cover md:h-[360px]"
                    />
                  ) : (
                    <div className="h-[290px] w-full bg-[radial-gradient(circle_at_20%_20%,rgba(153,8,8,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(237,197,55,0.3),transparent_38%),linear-gradient(120deg,#0f0808,#1a0c08)] md:h-[360px]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0808]/55 via-[#0a0808]/20 to-transparent" />
                </div>
                <div className="relative z-10 mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7000]">Featured Story</p>
                  <h2 className="mt-2 text-2xl font-black text-[#7a0b0b] md:text-3xl">{selectedBlog.title}</h2>
                  {selectedBlog.excerpt && (
                    <p className="mt-2 text-sm text-[#5b3b18]">{selectedBlog.excerpt}</p>
                  )}
                  {selectedBlog.content && (
                    <p className="mt-3 text-sm text-[#2f210f]">{selectedBlog.content}</p>
                  )}
                </div>
              </article>
            )}

            <div className="max-h-[620px] space-y-4 overflow-y-auto pr-1">
              {listBlogs.map((blog) => (
                <button
                  key={blog.id}
                  type="button"
                  onClick={() => setSelectedBlogId(blog.id)}
                  className="blog-side-card group block w-full text-left"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="blog-thumb-image h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,#990808,#EDC537)] opacity-70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#7a0b0b]">{blog.title}</h3>
                      {blog.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-[#5b3b18]">{blog.excerpt}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      </div>
    </div>
  );
}

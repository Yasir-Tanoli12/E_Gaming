"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content-api";
import { BrandTextureBackdrop } from "@/components/legal/BrandTextureBackdrop";
import { PublicNavbar } from "@/components/PublicNavbar";
import { usePublicSiteContent } from "@/lib/hooks/use-site-queries";

export default function BlogsPage() {
  const contentQuery = usePublicSiteContent();
  const content: SiteContent | null = contentQuery.data ?? null;
  const loading = contentQuery.isPending;
  const error =
    contentQuery.error instanceof Error
      ? contentQuery.error.message
      : contentQuery.error
        ? String(contentQuery.error)
        : "";

  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

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
    <div className="relative flex min-h-screen flex-col overflow-x-clip text-[#161015]">
      <BrandTextureBackdrop className="fixed inset-0 z-0" />
      <PublicNavbar />
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl flex-1 px-[max(1rem,env(safe-area-inset-left))] pb-12 pe-[max(1rem,env(safe-area-inset-right))] pt-6 lg:pt-8">
        <div className="mb-8 flex flex-wrap items-start gap-4 lg:mb-10">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="SWEEPSTOWN logo"
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[#AAE847]/60 shadow-[0_0_24px_rgba(237,197,55,0.35)]"
            />
          ) : (
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EB523F] to-[#EA3699] text-sm font-black text-white shadow-[0_0_24px_rgba(237,197,55,0.35)]">
              ST
            </span>
          )}
          <header className="sw-legal-animate-left min-w-0 flex-1 text-center lg:text-left">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EB523F]">
              Editorial
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              <span className="text-[#161015]">Our </span>
              <span className="bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] bg-clip-text text-transparent">
                Blogs
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#161015]/80 md:text-base lg:mx-0">
              Fresh posts, updates, and stories in the SWEEPSTOWN style.
            </p>
          </header>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#EB523F] border-t-transparent" />
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161015]/65 via-[#161015]/25 to-transparent" />
                </div>
                <div className="relative z-10 mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#EA3699]">Featured Story</p>
                  <h2 className="mt-2 text-2xl font-black text-[#161015] md:text-3xl">{selectedBlog.title}</h2>
                  {selectedBlog.excerpt && (
                    <p className="mt-2 text-sm text-zinc-700">{selectedBlog.excerpt}</p>
                  )}
                  {selectedBlog.content && (
                    <p className="mt-3 text-sm text-zinc-700">{selectedBlog.content}</p>
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
                        <div className="h-full w-full bg-[linear-gradient(135deg,#EB523F,#EA3699)] opacity-70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#161015]">{blog.title}</h3>
                      {blog.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-700">{blog.excerpt}</p>
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
  );
}

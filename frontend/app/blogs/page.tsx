"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { contentApi, type SiteContent } from "@/lib/content-api";

export default function BlogsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, isInitialized, router]);

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

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050814] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Content</p>
            <h1 className="mt-2 text-4xl font-black">Blogs</h1>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
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
        ) : !content?.blogs?.length ? (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-5 text-sm text-zinc-400">
            No blogs published yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.blogs.map((blog) => (
              <article
                key={blog.id}
                className="rounded-xl border border-cyan-300/20 bg-[#0b1331]/70 p-4"
              >
                {blog.imageUrl && (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="mb-3 h-44 w-full rounded-lg object-cover"
                  />
                )}
                <h2 className="text-xl font-bold">{blog.title}</h2>
                {blog.excerpt && (
                  <p className="mt-2 text-sm text-cyan-100/70">{blog.excerpt}</p>
                )}
                {blog.content && (
                  <p className="mt-3 text-sm text-zinc-300">{blog.content}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

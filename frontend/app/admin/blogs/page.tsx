"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { gamesApi } from "@/lib/games-api";
import { contentApi, type BlogItem } from "@/lib/content-api";

export default function AdminBlogsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", imageUrl: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setBlogs(data.blogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addBlog() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      await contentApi.createBlog({
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      });
      setForm({ title: "", excerpt: "", content: "", imageUrl: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create blog");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await contentApi.removeBlog(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((p) => ({ ...p, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="text-zinc-400">Loading blogs...</div>;

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Blogs</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage blog posts for the editorial section.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Add blog</h2>
        <div className="grid gap-4">
          <Input label="Blog title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Input label="Short excerpt" value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
              Upload blog image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files?.[0] ?? null)}
              className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
            />
            {uploading && <p className="mt-1 text-xs text-zinc-400">Uploading...</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium !text-zinc-200">Full blog content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
            />
          </div>
          <Button onClick={addBlog} loading={saving} disabled={!form.title.trim()}>Add Blog</Button>
        </div>

        <div className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
          <h3 className="text-sm font-semibold text-zinc-200">Existing blogs</h3>
          {blogs.length === 0 ? (
            <p className="text-sm text-zinc-500">No blogs yet.</p>
          ) : (
            blogs.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">{item.title}</p>
                  {item.excerpt && <p className="text-sm text-zinc-400">{item.excerpt}</p>}
                </div>
                <Button variant="secondary" onClick={() => deleteBlog(item.id)}>Delete</Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

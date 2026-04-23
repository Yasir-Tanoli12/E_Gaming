"use client";

import { useEffect, useState } from "react";
import { newsApi, type NewsPoster } from "@/lib/news-api";
import { gamesApi } from "@/lib/games-api";
import { resolveUploadMediaUrl } from "@/lib/media-url";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    isActive: true,
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await newsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((p) => ({ ...p, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await newsApi.create({
        title: form.title || undefined,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      });
      setForm({ title: "", imageUrl: "", isActive: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: NewsPoster) {
    try {
      await newsApi.update(item.id, { isActive: !item.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this poster?")) return;
    try {
      await newsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="text-white">
      <h1 className="text-2xl font-black sm:text-3xl">News Poster</h1>
      <p className="mt-1 text-zinc-400">
        This poster appears when the website loads for users.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <Input
          label="Title (optional)"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
            Upload poster image (local file)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
          />
          {uploading && <p className="mt-1 text-xs text-cyan-300">Uploading...</p>}
          <p className="mt-1 text-xs text-zinc-500">
            Manual image/link URLs are disabled. Use local upload only.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
          Active (show on first load)
        </label>
        <div>
          <Button onClick={save} loading={saving} disabled={!form.imageUrl}>
            Add Poster
          </Button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {loading ? (
          <div className="p-6 text-zinc-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-zinc-500">No posters yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-sm text-zinc-400">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3">
                    <img
                      src={resolveUploadMediaUrl(item.imageUrl) ?? ""}
                      alt=""
                      className="h-12 w-24 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{item.title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs ${item.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-700 text-zinc-400"}`}>
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => toggleActive(item)}>
                        {item.isActive ? "Hide" : "Show"}
                      </Button>
                      <Button variant="secondary" onClick={() => remove(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

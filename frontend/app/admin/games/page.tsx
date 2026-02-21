"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gamesApi, type Game, type CreateGameInput } from "@/lib/games-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState<CreateGameInput>({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    gameLink: "",
    sortOrder: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [topIds, setTopIds] = useState<string[]>([]);
  const [togglingTopId, setTogglingTopId] = useState<string | null>(null);

  async function loadGames() {
    setLoading(true);
    setError("");
    try {
      const [data, top] = await Promise.all([gamesApi.listAdmin(), gamesApi.listTop()]);
      setGames(data);
      setTopIds(top.map((g) => g.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      gameLink: "",
      sortOrder: games.length,
      isActive: true,
    });
    setShowForm(true);
  }

  function openEdit(game: Game) {
    setEditing(game);
    setForm({
      title: game.title,
      description: game.description ?? "",
      thumbnailUrl: game.thumbnailUrl ?? "",
      videoUrl: game.videoUrl ?? "",
      gameLink: game.gameLink,
      sortOrder: game.sortOrder,
      isActive: game.isActive ?? true,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        description: form.description || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        videoUrl: form.videoUrl || undefined,
      };
      if (editing) {
        await gamesApi.update(editing.id, payload);
      } else {
        await gamesApi.create(payload);
      }
      closeForm();
      loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    setDeletingId(id);
    setError("");
    try {
      await gamesApi.remove(id);
      loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleThumbnailUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-wide text-white">Game Card Studio</h1>
          <p className="mt-1 text-cyan-100/70">
            Build an attractive game lobby with image/video cards and local uploads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost">← Users</Button>
          </Link>
          <Button onClick={openAdd}>+ Add game</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="auth-card mb-8 rounded-3xl border border-fuchsia-400/30 bg-gradient-to-br from-[#121736] to-[#0b1028] p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editing ? "Edit game" : "Add game"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Game title"
              required
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
            />
            <Input
              label="Thumbnail URL (image)"
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Upload thumbnail from local system
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailUpload(e.target.files?.[0] ?? null)}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                />
                {uploading && (
                  <span className="text-sm text-cyan-300">Uploading...</span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Upload image and it will auto-fill the thumbnail URL.
              </p>
            </div>
            <Input
              label="Hover video URL (video)"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://..."
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Upload hover video from local system
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoUpload(e.target.files?.[0] ?? null)}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Upload video and it will auto-fill the hover video URL.
              </p>
            </div>
            <Input
              label="Game link (play URL)"
              value={form.gameLink}
              onChange={(e) => setForm({ ...form, gameLink: e.target.value })}
              placeholder="https://..."
              required
            />
            <Input
              label="Sort order"
              type="number"
              min={0}
              value={String(form.sortOrder)}
              onChange={(e) =>
                setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })
              }
            />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? "Save" : "Add"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-cyan-300/20 bg-[#0a1330]/70 p-12 text-center text-cyan-100/70">
          No games yet. Click &quot;Add game&quot; to create one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cyan-300/20 bg-[#091129]/75">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-300/15 text-left">
                <th className="px-4 py-3 text-sm font-medium text-cyan-100/70">
                  Preview
                </th>
                <th className="px-4 py-3 text-sm font-medium text-cyan-100/70">
                  Title
                </th>
                <th className="px-4 py-3 text-sm font-medium text-cyan-100/70">
                  Top
                </th>
                <th className="px-4 py-3 text-sm font-medium text-cyan-100/70">
                  Game link
                </th>
                <th className="px-4 py-3 text-sm font-medium text-cyan-100/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-cyan-300/10 last:border-0"
                >
                  <td className="px-4 py-3">
                    {g.thumbnailUrl ? (
                      <div className="h-12 w-20 overflow-hidden rounded bg-zinc-800">
                        <img
                          src={g.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{g.title}</td>
                  <td className="px-4 py-3">
                    {topIds.includes(g.id) ? (
                      <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-300">
                        TOP
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={g.gameLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-300 hover:underline"
                    >
                      {g.gameLink.slice(0, 40)}...
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => openEdit(g)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        loading={togglingTopId === g.id}
                        onClick={async () => {
                          setTogglingTopId(g.id);
                          setError("");
                          try {
                            const isTop = topIds.includes(g.id);
                            const next = isTop
                              ? topIds.filter((id) => id !== g.id)
                              : Array.from(new Set([...topIds, g.id]));
                            await gamesApi.setTopGames(next);
                            setTopIds(next);
                          } catch (err) {
                            setError(
                              err instanceof Error ? err.message : "Failed to update top game",
                            );
                          } finally {
                            setTogglingTopId(null);
                          }
                        }}
                      >
                        {topIds.includes(g.id) ? "Remove Top" : "Make Top Game"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(g.id)}
                        loading={deletingId === g.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-xs text-zinc-400">
        Use <span className="text-amber-300">Make Top Game</span> in each row. Top games are shown first in the user grid.
      </div>
    </div>
  );
}

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

  async function loadGames() {
    setLoading(true);
    setError("");
    try {
      const data = await gamesApi.listAdmin();
      setGames(data);
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
      isActive: true,
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Game cards</h1>
          <p className="mt-1 text-zinc-400">
            Add, edit, or remove game cards. Use video URLs for preview and game
            links for play.
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="ghost">← Users</Button>
        </Link>
        <Button onClick={openAdd}>+ Add game</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="auth-card mb-8 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-6">
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
              label="Thumbnail URL (optional)"
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
            <Input
              label="Video URL (optional) – preview on card"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://..."
            />
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
          No games yet. Click &quot;Add game&quot; to create one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">
                  Preview
                </th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">
                  Title
                </th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">
                  Game link
                </th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3">
                    {(g.videoUrl || g.thumbnailUrl) ? (
                      <div className="h-12 w-20 overflow-hidden rounded bg-zinc-800">
                        {g.videoUrl ? (
                          <video
                            src={g.videoUrl}
                            muted
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={g.thumbnailUrl!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{g.title}</td>
                  <td className="px-4 py-3">
                    <a
                      href={g.gameLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-400 hover:underline"
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
    </div>
  );
}

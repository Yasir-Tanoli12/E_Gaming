"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  gamesApi,
  type Game,
  type CreateGameInput,
} from "@/lib/games-api";
import { resolveUploadMediaUrl } from "@/lib/media-url";
import { getVideoDurationSeconds } from "@/lib/video-duration";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const MAX_GAME_MEDIA_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 35;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov)$/i;

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
  const [uploadTarget, setUploadTarget] = useState<"thumbnail" | "video" | null>(null);
  const [thumbFileKey, setThumbFileKey] = useState(0);
  const [videoFileKey, setVideoFileKey] = useState(0);
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
      const link = form.gameLink.trim();
      if (!/^https?:\/\/\S+/i.test(link)) {
        setError("Game link must start with http:// or https:// (full URL to the game).");
        return;
      }
      const thumbTrim = (form.thumbnailUrl ?? "").trim();
      const videoTrim = (form.videoUrl ?? "").trim();
      if (!editing && !thumbTrim) {
        setError("Choose a thumbnail image from your device (no URL field — use the file picker).");
        return;
      }
      const payload: CreateGameInput = {
        title: form.title,
        description: form.description || undefined,
        gameLink: form.gameLink.trim(),
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        thumbnailUrl:
          thumbTrim === "" ? (editing ? null : undefined) : thumbTrim,
        videoUrl: videoTrim === "" ? (editing ? null : undefined) : videoTrim,
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
    const hasImageMime = file.type.toLowerCase().startsWith("image/");
    const hasImageExt = IMAGE_EXT_RE.test(file.name);
    if (!hasImageMime && !hasImageExt) {
      setError("Thumbnail must be an image file (.jpg/.png/.webp/.gif).");
      return;
    }
    if (file.size > MAX_GAME_MEDIA_BYTES) {
      setError("Thumbnail is too large (max 100MB).");
      return;
    }
    setUploadTarget("thumbnail");
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadTarget(null);
    }
  }

  async function handleVideoUpload(file: File | null) {
    if (!file) return;
    const hasVideoMime = file.type.toLowerCase().startsWith("video/");
    const hasVideoExt = VIDEO_EXT_RE.test(file.name);
    if (!hasVideoMime && !hasVideoExt) {
      setError("Hover video must be .mp4/.webm/.ogg/.mov.");
      return;
    }
    if (file.size > MAX_GAME_MEDIA_BYTES) {
      setError("Hover video is too large (max 100MB).");
      return;
    }
    try {
      const seconds = await getVideoDurationSeconds(file);
      if (seconds > MAX_VIDEO_DURATION_SECONDS) {
        setError(
          `Hover video is too long (${Math.ceil(seconds)}s). Maximum allowed is ${MAX_VIDEO_DURATION_SECONDS}s.`
        );
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not validate hover video duration."
      );
      return;
    }
    setUploadTarget("video");
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadTarget(null);
    }
  }

  function displayGameLink(link: string) {
    const t = link.trim();
    if (t.length <= 52) return t;
    return `${t.slice(0, 50)}…`;
  }

  const fileInputClass =
    "block w-full max-w-md cursor-pointer rounded-lg border border-white/10 bg-[#0c0c0f] px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200 hover:file:bg-white/15";

  return (
    <div className="space-y-8 text-zinc-100">
      <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Content
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Game lobby
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            Thumbnail and hover video are always chosen as files from your computer (no image
            or video URLs). Only the Play link is a typed URL.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/admin/dashboard" className="sm:order-first">
            <Button variant="ghost" className="w-full sm:w-auto">
              ← Users
            </Button>
          </Link>
          <Button variant="accent" onClick={openAdd} className="w-full sm:w-auto">
            Add game
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/95"
        >
          {error}
        </div>
      )}

      {showForm && (
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">
            {editing ? "Edit game" : "New game"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Use <span className="font-medium text-zinc-400">Choose file</span> for thumbnail and
            optional video — do not paste image or video links. The server stores the uploaded
            file path automatically.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Game title"
              required
              className="!border-white/10 !bg-[#0c0c0f] !text-zinc-100"
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              className="!border-white/10 !bg-[#0c0c0f] !text-zinc-100"
            />
            <div>
              <label className="mb-2 block text-sm font-medium !text-zinc-200">
                Thumbnail image <span className="font-normal text-zinc-500">(required — from device)</span>
              </label>
              <input
                key={`thumb-${thumbFileKey}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailUpload(e.target.files?.[0] ?? null)}
                className={fileInputClass}
              />
              {uploadTarget === "thumbnail" && (
                <p className="mt-2 text-xs text-amber-200/80">Uploading thumbnail…</p>
              )}
              {form.thumbnailUrl ? (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <img
                    src={resolveUploadMediaUrl(form.thumbnailUrl) ?? ""}
                    alt="Thumbnail preview"
                    className="h-24 w-40 rounded-lg object-cover ring-1 ring-white/15"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="!text-xs"
                    onClick={() => {
                      setForm((p) => ({ ...p, thumbnailUrl: "" }));
                      setThumbFileKey((k) => k + 1);
                    }}
                  >
                    Remove & pick another file
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-zinc-600">No image selected yet.</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium !text-zinc-200">
                Hover video <span className="font-normal text-zinc-500">(optional — from device)</span>
              </label>
              <input
                key={`vid-${videoFileKey}`}
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e.target.files?.[0] ?? null)}
                className={fileInputClass}
              />
              {uploadTarget === "video" && (
                <p className="mt-2 text-xs text-amber-200/80">Uploading video…</p>
              )}
              {form.videoUrl ? (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <video
                    src={resolveUploadMediaUrl(form.videoUrl) ?? ""}
                    muted
                    playsInline
                    className="h-24 max-w-[240px] rounded-lg object-cover ring-1 ring-white/15"
                    preload="metadata"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="!text-xs"
                    onClick={() => {
                      setForm((p) => ({ ...p, videoUrl: "" }));
                      setVideoFileKey((k) => k + 1);
                    }}
                  >
                    Remove & pick another file
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-zinc-600">No video selected (hover will use thumbnail only).</p>
              )}
            </div>
            <Input
              label="Game URL (opens when users play)"
              value={form.gameLink}
              onChange={(e) => setForm({ ...form, gameLink: e.target.value })}
              placeholder="https://example.com/game"
              required
              className="!border-white/10 !bg-[#0c0c0f] !text-zinc-100"
            />
            <Input
              label="Sort order"
              type="number"
              min={0}
              value={String(form.sortOrder)}
              onChange={(e) =>
                setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })
              }
              className="!border-white/10 !bg-[#0c0c0f] !text-zinc-100"
            />
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="submit" variant="accent" loading={submitting}>
                {editing ? "Save changes" : "Create game"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-400/80" />
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-sm text-zinc-400">No games yet.</p>
          <Button variant="accent" className="mt-4" onClick={openAdd}>
            Add your first game
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {games.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/10">
                    {g.thumbnailUrl ? (
                      <img
                        src={resolveUploadMediaUrl(g.thumbnailUrl) ?? ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                        No art
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white">{g.title}</p>
                      {topIds.includes(g.id) && (
                        <span className="shrink-0 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                          Top
                        </span>
                      )}
                    </div>
                    <p className="mt-1 break-all font-mono text-xs text-zinc-500">
                      {displayGameLink(g.gameLink)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="!py-2 text-xs" onClick={() => openEdit(g)}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    className="!py-2 text-xs"
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
                    {topIds.includes(g.id) ? "Remove top" : "Featured"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="col-span-2 !py-2 text-xs text-red-300/90 hover:border-red-500/30"
                    onClick={() => handleDelete(g.id)}
                    loading={deletingId === g.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Preview
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Featured
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Game URL
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {games.map((g) => (
                  <tr key={g.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="h-12 w-20 overflow-hidden rounded-md bg-zinc-800 ring-1 ring-white/10">
                        {g.thumbnailUrl ? (
                          <img
                            src={resolveUploadMediaUrl(g.thumbnailUrl) ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-200">{g.title}</td>
                    <td className="px-5 py-4">
                      {topIds.includes(g.id) ? (
                        <span className="inline-flex rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200/90">
                          Top pick
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="max-w-[200px] px-5 py-4 lg:max-w-xs">
                      <a
                        href={g.gameLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-mono text-xs text-amber-200/70 hover:text-amber-200 hover:underline"
                        title={g.gameLink}
                      >
                        {displayGameLink(g.gameLink)}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="!py-2 text-xs"
                          onClick={() => openEdit(g)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="!py-2 text-xs"
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
                          {topIds.includes(g.id) ? "Remove top" : "Featured"}
                        </Button>
                        <Button
                          variant="secondary"
                          className="!py-2 text-xs"
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
        </>
      )}
      {!loading && games.length > 0 && (
        <p className="text-xs leading-relaxed text-zinc-500">
          <span className="font-medium text-zinc-400">Featured</span> games appear first on the
          public lobby. Each game&apos;s Play link must be a full <code className="text-zinc-400">https://…</code>{" "}
          URL; thumbnail and hover video are always uploaded files, not pasted links.
        </p>
      )}
    </div>
  );
}

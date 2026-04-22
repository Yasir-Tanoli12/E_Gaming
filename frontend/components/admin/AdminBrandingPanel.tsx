"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { contentApi } from "@/lib/content-api";
import { resolveUploadMediaUrl } from "@/lib/media-url";
import { getVideoDurationSeconds } from "@/lib/video-duration";

function formatLoadError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError || err.status >= 500) {
      const code = err.status > 0 ? `HTTP ${err.status}` : "network error";
      return `Could not load branding (${code}). Check that NEXT_PUBLIC_API_URL points at your API and nginx proxies /content to NestJS.`;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Failed to load branding";
}

const MAX_LOBBY_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_LOBBY_VIDEO_SECONDS = 35;
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov)$/i;

/**
 * Brand logo + lobby hero video uploads (moved from Contacts to main admin dashboard).
 */
export function AdminBrandingPanel() {
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLobbyVideo, setUploadingLobbyVideo] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [lobbyVideoUrl, setLobbyVideoUrl] = useState("");

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
    }
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setLogoUrl(data.contacts.logoUrl ?? "");
      setLobbyVideoUrl(data.contacts.lobbyVideoUrl ?? "");
    } catch (err) {
      setError(formatLoadError(err));
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadLogo(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for logo.");
      return;
    }
    setUploadingLogo(true);
    setError("");
    try {
      const res = await contentApi.uploadLogo(file);
      setLogoUrl(res.logoUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function uploadLobbyVideo(file: File | null) {
    if (!file) return;
    const hasVideoMime = file.type.toLowerCase().startsWith("video/");
    const hasVideoExt = VIDEO_EXT_RE.test(file.name);
    if (!hasVideoMime && !hasVideoExt) {
      setError("Only video files are allowed for lobby (.mp4/.webm/.ogg/.mov).");
      return;
    }
    if (file.size > MAX_LOBBY_VIDEO_BYTES) {
      setError("Lobby video is too large (max 100MB).");
      return;
    }
    try {
      const seconds = await getVideoDurationSeconds(file);
      if (seconds > MAX_LOBBY_VIDEO_SECONDS) {
        setError(
          `Lobby video is too long (${Math.ceil(seconds)}s). Maximum allowed is ${MAX_LOBBY_VIDEO_SECONDS}s.`
        );
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not validate lobby video duration."
      );
      return;
    }
    setUploadingLobbyVideo(true);
    setError("");
    try {
      const res = await contentApi.uploadLobbyVideo(file);
      setLobbyVideoUrl(res.lobbyVideoUrl ?? "");
      // Do not call load() here: GET /content/admin can fail separately (502/HTML from nginx) and
      // would overwrite this success with a misleading "server unavailable" banner.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload lobby video");
    } finally {
      setUploadingLobbyVideo(false);
    }
  }

  const logoPreview = resolveUploadMediaUrl(logoUrl);
  const lobbyPreview = resolveUploadMediaUrl(lobbyVideoUrl);

  if (loading) {
    return (
      <section className="flex min-h-[140px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400/80" />
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Branding
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Logo &amp; lobby video</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Shown in the public navbar, footer, and the hero section on the user dashboard.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/95"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs font-medium text-amber-300 underline hover:text-amber-200"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-200">Brand logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void uploadLogo(e.target.files?.[0] ?? null)}
            className="w-full max-w-md cursor-pointer rounded-lg border border-white/10 bg-[#0c0c0f] px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
          />
          {uploadingLogo && (
            <p className="mt-1 text-xs text-amber-200/80">Uploading logo…</p>
          )}
          {logoPreview && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2">
              <img
                src={logoPreview}
                alt="Site logo preview"
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-cyan-400/30"
              />
              <p className="text-xs text-cyan-100/85">Logo is active site-wide</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-200">
            Lobby video (dashboard hero)
          </label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => void uploadLobbyVideo(e.target.files?.[0] ?? null)}
            className="w-full max-w-md cursor-pointer rounded-lg border border-white/10 bg-[#0c0c0f] px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
          />
          {uploadingLobbyVideo && (
            <p className="mt-1 text-xs text-amber-200/80">Uploading lobby video…</p>
          )}
          {lobbyPreview && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-2">
              <video
                src={lobbyPreview}
                className="h-16 w-28 rounded-lg object-cover ring-1 ring-fuchsia-400/30"
                muted
                playsInline
                preload="metadata"
              />
              <p className="text-xs text-fuchsia-100/85">Lobby video is active on dashboard hero</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

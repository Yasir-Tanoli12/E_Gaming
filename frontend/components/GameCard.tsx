"use client";

import { memo, useState } from "react";
import type { Game } from "@/lib/games-api";
import { resolveUploadMediaUrl } from "@/lib/media-url";
import { useLobbyAudio } from "@/contexts/LobbyAudioContext";

interface GameCardProps {
  game: Game;
  isTop?: boolean;
  onPlayRequest?: (game: Game) => void;
}

function GameCardComponent({ game, isTop = false, onPlayRequest }: GameCardProps) {
  const { lobbySoundAllowed, allowLobbySound } = useLobbyAudio();
  const [hovered, setHovered] = useState(false);
  const [thumbFailedSrc, setThumbFailedSrc] = useState<string | null>(null);
  const [videoFailedSrc, setVideoFailedSrc] = useState<string | null>(null);
  const thumbnailUrl = resolveUploadMediaUrl(game.thumbnailUrl);
  const resolvedVideoField = resolveUploadMediaUrl(game.videoUrl);
  const maybeThumbIsVideo =
    !!thumbnailUrl &&
    (thumbnailUrl.toLowerCase().includes(".mp4") ||
      thumbnailUrl.toLowerCase().includes(".webm") ||
      thumbnailUrl.toLowerCase().includes(".ogg"));
  // Backward compatibility: if old records stored video in thumbnailUrl
  const videoUrl =
    resolvedVideoField ?? (maybeThumbIsVideo ? thumbnailUrl : null);
  const imageUrl = maybeThumbIsVideo ? null : thumbnailUrl;
  const thumbError = Boolean(imageUrl && thumbFailedSrc === imageUrl);
  const videoError = Boolean(videoUrl && videoFailedSrc === videoUrl);
  /** Thumbnail failed or missing but video works — show video (not a blank card). */
  const videoAsPrimary =
    Boolean(videoUrl && !videoError && (!imageUrl || thumbError));

  function handlePlay() {
    if (onPlayRequest) {
      onPlayRequest(game);
      return;
    }
    if (game.gameLink) {
      window.open(game.gameLink, "_blank", "noopener,noreferrer");
    }
  }

  function handleMouseEnter() {
    setHovered(true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  return (
    <div
      className="group relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border-[3px] border-[#161015] bg-[#161015] shadow-[6px_8px_0_#EB523F,0_0_0_2px_#EA3699] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_12px_0_#AAE847,0_0_0_3px_#EB523F]"
      onPointerDownCapture={() => {
        if (!lobbySoundAllowed) allowLobbySound();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(235,82,63,0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(234,54,153,0.28),transparent_45%)] opacity-80" />
      <div className="relative aspect-video w-full overflow-hidden bg-[#0c1025]">
        {imageUrl && !thumbError ? (
          // Stack above hidden video; on hover fade out so hover video (higher z) shows.
          <img
            src={imageUrl}
            alt={game.title}
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailedSrc(imageUrl)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
              hovered && videoUrl && !videoError && !videoAsPrimary
                ? "pointer-events-none z-10 opacity-0 scale-105"
                : "z-20 opacity-100 scale-100"
            }`}
          />
        ) : null}

        {videoUrl && !videoError ? (
          <video
            src={videoUrl}
            autoPlay
            muted={!lobbySoundAllowed}
            loop
            playsInline
            preload={videoAsPrimary ? "auto" : "metadata"}
            onError={() => setVideoFailedSrc(videoUrl)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 pointer-events-none ${
              hovered || videoAsPrimary
                ? "z-10 opacity-100 scale-100"
                : "z-0 opacity-0 scale-105"
            }`}
          />
        ) : null}

        {(!imageUrl || thumbError) && (!videoUrl || videoError) ? (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a0a] to-[#0f0808]">
            <span className="text-4xl font-black text-[#AAE847]/80">
              {game.title.charAt(0)}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className={`absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-t from-[#0a0808]/95 via-[#140808]/50 to-transparent transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handlePlay}
      >
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#161015] bg-gradient-to-r from-[#EB523F] to-[#EA3699] shadow-[4px_4px_0_#161015] transition-transform duration-200 hover:scale-110"
          aria-label={`Play ${game.title}`}
        >
          <svg
            className="ml-1 h-8 w-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0a0808] via-[#0a0808]/70 to-transparent p-4">
        <h3 className="font-bold tracking-wide text-white drop-shadow-lg">{game.title}</h3>
        {game.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[#EEEDEE]/90">
            {game.description}
          </p>
        )}
      </div>

      {isTop ? (
        <div className="absolute right-3 top-3 z-30 rounded-full border-2 border-[#161015] bg-[#AAE847] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#161015] shadow-[2px_2px_0_#161015]">
          TOP
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-30 rounded-full border-2 border-[#EA3699]/70 bg-[#161015]/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EEEDEE]">
          Hot
        </div>
      )}
    </div>
  );
}

export const GameCard = memo(GameCardComponent);

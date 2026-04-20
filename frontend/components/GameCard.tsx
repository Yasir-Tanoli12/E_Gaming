"use client";

import { memo, useRef, useState } from "react";
import type { Game } from "@/lib/games-api";
import { OptimizedImage } from "./OptimizedImage";

interface GameCardProps {
  game: Game;
  isTop?: boolean;
  onPlayRequest?: (game: Game) => void;
}

function GameCardComponent({ game, isTop = false, onPlayRequest }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailUrl = game.thumbnailUrl;
  const maybeThumbIsVideo =
    !!thumbnailUrl &&
    (thumbnailUrl.toLowerCase().includes(".mp4") ||
      thumbnailUrl.toLowerCase().includes(".webm") ||
      thumbnailUrl.toLowerCase().includes(".ogg"));
  // Backward compatibility: if old records stored video in thumbnailUrl
  const videoUrl = game.videoUrl ?? (maybeThumbIsVideo ? thumbnailUrl : null);
  const imageUrl = maybeThumbIsVideo ? null : thumbnailUrl;

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
    if (videoRef.current && videoUrl && !videoError) {
      videoRef.current.play().catch(() => {});
    }
  }

  function handleMouseLeave() {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-[#EDC537]/30 bg-[#0f0808] shadow-[0_0_0_1px_rgba(237,197,55,0.15),0_20px_45px_rgba(153,8,8,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(237,197,55,0.45),0_25px_55px_rgba(153,8,8,0.28)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(153,8,8,0.3),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(237,197,55,0.25),transparent_45%)] opacity-70" />
      <div className="relative aspect-video w-full overflow-hidden bg-[#0c1025]">
        {imageUrl && !thumbError ? (
          <OptimizedImage
            src={imageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setThumbError(true)}
            className={`object-cover transition-all duration-500 ${
              hovered && videoUrl && !videoError ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />
        ) : null}

        {videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            onLoadedData={() => {
              if (hovered) {
                videoRef.current?.play().catch(() => {});
              }
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          />
        ) : null}

        {!imageUrl && (!videoUrl || videoError) ? (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a0a] to-[#0f0808]">
            <span className="text-4xl font-black text-[#EDC537]/70">
              {game.title.charAt(0)}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0a0808]/95 via-[#140808]/50 to-transparent transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handlePlay}
      >
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-gradient-to-r from-[#990808] to-[#EDC537] shadow-[0_0_35px_rgba(237,197,55,0.5)] transition-all duration-300 hover:scale-110"
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

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0808] via-[#0a0808]/70 to-transparent p-4">
        <h3 className="font-bold tracking-wide text-white drop-shadow-lg">{game.title}</h3>
        {game.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[#fef3c7]/85">
            {game.description}
          </p>
        )}
      </div>

      {isTop ? (
        <div className="absolute right-3 top-3 rounded-full border border-[#EDC537]/70 bg-[#EDC537]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a0a0a] shadow-[0_0_18px_rgba(237,197,55,0.45)]">
          TOP
        </div>
      ) : (
        <div className="absolute right-3 top-3 rounded-full border border-[#EDC537]/50 bg-[#140808]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#EDC537]">
          Hot
        </div>
      )}
    </div>
  );
}

export const GameCard = memo(GameCardComponent);

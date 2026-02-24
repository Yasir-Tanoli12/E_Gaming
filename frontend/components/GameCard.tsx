"use client";

import { useState, useRef } from "react";
import type { Game } from "@/lib/games-api";

interface GameCardProps {
  game: Game;
  isTop?: boolean;
  onPlayRequest?: (game: Game) => void;
}

export function GameCard({ game, isTop = false, onPlayRequest }: GameCardProps) {
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
      className="group relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-[#0b1330] shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_20px_45px_rgba(6,182,212,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(244,114,182,0.45),0_25px_55px_rgba(236,72,153,0.28)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.3),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.28),transparent_45%)] opacity-70" />
      <div className="aspect-video w-full overflow-hidden bg-[#0c1025]">
        {imageUrl && !thumbError ? (
          <img
            src={imageUrl}
            alt={game.title}
            onError={() => setThumbError(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
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
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1f3f] to-[#090d20]">
            <span className="text-4xl font-black text-cyan-300/70">
              {game.title.charAt(0)}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#080e22]/90 via-[#0b1739]/40 to-transparent transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handlePlay}
      >
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_35px_rgba(217,70,239,0.6)] transition-all duration-300 hover:scale-110"
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

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050a18] via-[#050a18]/60 to-transparent p-4">
        <h3 className="font-bold tracking-wide text-white drop-shadow-lg">{game.title}</h3>
        {game.description && (
          <p className="mt-1 line-clamp-2 text-sm text-cyan-100/80">
            {game.description}
          </p>
        )}
      </div>

      {isTop ? (
        <div className="absolute right-3 top-3 rounded-full border border-amber-300/70 bg-amber-400/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.45)]">
          TOP
        </div>
      ) : (
        <div className="absolute right-3 top-3 rounded-full border border-cyan-300/50 bg-[#07142f]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
          Hot
        </div>
      )}
    </div>
  );
}

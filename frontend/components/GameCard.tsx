"use client";

import { useState, useRef } from "react";
import type { Game } from "@/lib/games-api";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaUrl = game.videoUrl ?? game.thumbnailUrl;
  const isVideo = Boolean(game.videoUrl);

  function handlePlay() {
    if (game.gameLink) {
      window.open(game.gameLink, "_blank", "noopener,noreferrer");
    }
  }

  function handleMouseEnter() {
    setHovered(true);
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setVideoPlaying(true);
    }
  }

  function handleMouseLeave() {
    setHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoPlaying(false);
    }
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-emerald-500/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video w-full overflow-hidden bg-zinc-800">
        {isVideo ? (
          <video
            ref={videoRef}
            src={game.videoUrl!}
            poster={game.thumbnailUrl ?? undefined}
            muted
            loop
            playsInline
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-4xl font-bold text-zinc-600">
              {game.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Hover overlay with play button */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handlePlay}
      >
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-emerald-500"
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

      {/* Title overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <h3 className="font-semibold text-white drop-shadow-lg">{game.title}</h3>
        {game.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-300">
            {game.description}
          </p>
        )}
      </div>
    </div>
  );
}

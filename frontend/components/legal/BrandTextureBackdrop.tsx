"use client";

import { useId } from "react";

type Props = {
  /** e.g. `fixed inset-0 z-0` or `absolute inset-0` */
  className?: string;
};

/**
 * Shared gaming-style texture: gradient mesh, line grid, orbs, vector accents.
 * Use `useId`-scoped SVG defs so multiple instances never clash.
 */
export function BrandTextureBackdrop({ className = "absolute inset-0" }: Props) {
  const uid = useId().replace(/:/g, "");
  const grad = `lg-grad-${uid}`;
  const filt = `lg-glow-${uid}`;

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8fb] via-[#E9DFE5] to-[#f0ffd8]" />

      {/* Blurs + SVG filters are expensive on many phones — keep full treatment from md up. */}
      <div className="hidden md:block">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              105deg,
              transparent,
              transparent 20px,
              rgba(235, 82, 63, 0.14) 20px,
              rgba(235, 82, 63, 0.14) 21px
            ),
            repeating-linear-gradient(
              -105deg,
              transparent,
              transparent 26px,
              rgba(170, 232, 71, 0.18) 26px,
              rgba(170, 232, 71, 0.18) 27px
            ),
            linear-gradient(
              155deg,
              rgba(234, 54, 153, 0.12) 0%,
              transparent 38%,
              rgba(235, 82, 63, 0.1) 100%
            )
          `,
          }}
        />

        <div className="absolute -left-8 top-1/4 h-72 w-72 rounded-full bg-[#EB523F]/40 blur-[88px]" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#EA3699]/35 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#AAE847]/45 blur-[72px]" />

        <svg
          className="absolute inset-0 z-[1] h-full w-full object-cover opacity-[0.92]"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EB523F" />
              <stop offset="50%" stopColor="#EA3699" />
              <stop offset="100%" stopColor="#AAE847" />
            </linearGradient>
            <filter id={filt} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M420 120 L520 200 L480 340 L320 300 Z"
            stroke={`url(#${grad})`}
            strokeWidth="3.5"
            filter={`url(#${filt})`}
            opacity="0.95"
          />
          <path
            d="M80 480 L260 420 L300 620 L100 700 Z"
            stroke={`url(#${grad})`}
            strokeWidth="3"
            filter={`url(#${filt})`}
            opacity="0.85"
          />
          <rect
            x="340"
            y="520"
            width="200"
            height="120"
            rx="16"
            stroke="#EB523F"
            strokeWidth="2.5"
            opacity="0.65"
            filter={`url(#${filt})`}
          />
          <circle cx="180" cy="220" r="64" stroke="#EA3699" strokeWidth="3" opacity="0.75" filter={`url(#${filt})}`} />
          <path
            d="M140 760 H460 M140 800 H400 M140 840 H440"
            stroke="#161015"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d="M420 640 H560 M420 680 H520"
            stroke="#161015"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.14"
          />
        </svg>

        <div className="absolute inset-0 z-[2] shadow-[inset_0_0_120px_rgba(22,16,21,0.07),inset_0_0_110px_rgba(235,82,63,0.11),inset_0_0_130px_rgba(170,232,71,0.1)]" />
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#EB523F]/10 via-transparent to-[#AAE847]/12 md:hidden" />
    </div>
  );
}

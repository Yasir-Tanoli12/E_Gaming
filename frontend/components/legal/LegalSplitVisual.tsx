/**
 * Decorative right panel for About / Privacy split layouts.
 * Pure presentation — no data fetching.
 */
export function LegalSplitVisual({ variant }: { variant: "about" | "privacy" }) {
  const orbAccent = variant === "privacy" ? "opacity-90" : "opacity-100";
  return (
    <div
      className="relative h-full min-h-[300px] w-full overflow-hidden lg:min-h-[calc(100svh-5.25rem)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#0D0F1A]" />

      {/* Soft geometric lines */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              105deg,
              transparent,
              transparent 22px,
              rgba(235, 82, 63, 0.12) 22px,
              rgba(235, 82, 63, 0.12) 23px
            ),
            repeating-linear-gradient(
              -105deg,
              transparent,
              transparent 28px,
              rgba(170, 232, 71, 0.07) 28px,
              rgba(170, 232, 71, 0.07) 29px
            ),
            linear-gradient(
              165deg,
              rgba(234, 54, 153, 0.15) 0%,
              transparent 42%,
              rgba(235, 82, 63, 0.12) 100%
            )
          `,
        }}
      />

      {/* Glow orbs */}
      <div className="absolute -left-10 top-1/4 h-72 w-72 rounded-full bg-[#EB523F]/35 blur-[100px]" />
      <div
        className={`absolute right-0 top-0 h-96 w-96 rounded-full bg-[#EA3699]/30 blur-[110px] ${orbAccent}`}
      />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#AAE847]/20 blur-[90px]" />

      {/* Vector “dashboard” vibe */}
      <svg
        className="absolute inset-0 z-[1] h-full w-full object-cover opacity-95"
        viewBox="0 0 600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lg-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EB523F" />
            <stop offset="50%" stopColor="#EA3699" />
            <stop offset="100%" stopColor="#AAE847" />
          </linearGradient>
          <filter id="lg-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M420 120 L520 200 L480 340 L320 300 Z"
          stroke="url(#lg-stroke)"
          strokeWidth="3"
          filter="url(#lg-glow)"
          opacity="0.9"
        />
        <path
          d="M80 480 L260 420 L300 620 L100 700 Z"
          stroke="url(#lg-stroke)"
          strokeWidth="2.5"
          filter="url(#lg-glow)"
          opacity="0.75"
        />
        <rect
          x="340"
          y="520"
          width="200"
          height="120"
          rx="16"
          stroke="#AAE847"
          strokeWidth="2"
          opacity="0.55"
          filter="url(#lg-glow)"
        />
        <circle cx="180" cy="220" r="64" stroke="#EB523F" strokeWidth="2.5" opacity="0.65" filter="url(#lg-glow)" />
        <path
          d="M140 760 H460 M140 800 H400 M140 840 H440"
          stroke="#E9DFE5"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg>

      {/* Blend into left column */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#0D0F1A] from-0% via-[#0D0F1A]/55 via-38% to-transparent to-62%" />
      <div className="pointer-events-none absolute inset-0 z-[3] shadow-[inset_0_0_100px_rgba(235,82,63,0.14),inset_0_0_140px_rgba(234,54,153,0.1)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[4] w-px bg-gradient-to-b from-transparent via-[#AAE847]/50 to-transparent opacity-80" />
    </div>
  );
}

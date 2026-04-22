/**
 * Decorative right panel for About / Privacy split layouts.
 * Bright “popping” palette to match the rest of the site.
 */
export function LegalSplitVisual({ variant }: { variant: "about" | "privacy" | "contact" }) {
  const orbAccent = variant === "privacy" ? "opacity-95" : "opacity-100";
  return (
    <div
      className="relative h-full min-h-[300px] w-full overflow-hidden lg:min-h-[calc(100svh-5.25rem)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8fb] via-[#E9DFE5] to-[#f0ffd8]" />

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
      <div
        className={`absolute right-0 top-0 h-96 w-96 rounded-full bg-[#EA3699]/35 blur-[100px] ${orbAccent}`}
      />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#AAE847]/45 blur-[72px]" />

      <svg
        className="absolute inset-0 z-[1] h-full w-full object-cover opacity-[0.92]"
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
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M420 120 L520 200 L480 340 L320 300 Z"
          stroke="url(#lg-stroke)"
          strokeWidth="3.5"
          filter="url(#lg-glow)"
          opacity="0.95"
        />
        <path
          d="M80 480 L260 420 L300 620 L100 700 Z"
          stroke="url(#lg-stroke)"
          strokeWidth="3"
          filter="url(#lg-glow)"
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
          filter="url(#lg-glow)"
        />
        <circle cx="180" cy="220" r="64" stroke="#EA3699" strokeWidth="3" opacity="0.75" filter="url(#lg-glow)" />
        <path
          d="M140 760 H460 M140 800 H400 M140 840 H440"
          stroke="#161015"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.12"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#EEEDEE] from-0% via-[#EEEDEE]/65 via-32% to-transparent to-58%" />
      <div className="pointer-events-none absolute inset-0 z-[3] shadow-[inset_0_0_80px_rgba(235,82,63,0.12),inset_0_0_100px_rgba(170,232,71,0.1)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[4] w-1 rounded-full bg-gradient-to-b from-[#EB523F] via-[#AAE847] to-[#EA3699] opacity-90 shadow-[0_0_16px_rgba(235,82,63,0.5)]" />
    </div>
  );
}

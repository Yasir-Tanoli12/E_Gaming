"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReviewItem } from "@/lib/content-api";

const ELASTIC = "cubic-bezier(0.34, 1.65, 0.52, 1.12)";
const SHADOW_IDLE =
  "8px 12px 0 rgba(15, 10, 18, 0.92), 0 0 0 4px #EB523F, 0 0 0 8px #EA3699";
const SHADOW_HOVER =
  "14px 22px 0 rgba(15, 10, 18, 0.95), 0 0 0 5px #AAE847, 0 0 0 10px #EB523F";

function PersonIcon() {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-[#EB523F] bg-gradient-to-br from-[#EA3699] to-[#EB523F] shadow-[4px_4px_0_#161015]"
      aria-hidden
    >
      <svg className="h-7 w-7 text-[#EEEDEE]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

function buildStack(reviews: ReviewItem[]): { item: ReviewItem; key: string }[] {
  if (reviews.length === 0) return [];
  const minSlots = 5;
  const cap = 11;
  const target = Math.min(cap, Math.max(minSlots, reviews.length));
  const out: { item: ReviewItem; key: string }[] = [];
  for (let i = 0; i < target; i++) {
    const item = reviews[i % reviews.length]!;
    out.push({ item, key: `${item.id}-${i}` });
  }
  return out;
}

export function InteractiveReviewCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const stack = useMemo(() => buildStack(reviews), [reviews]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const targetBias = useRef(0);
  const smoothBias = useRef(0);
  const rafRef = useRef(0);
  const [bias, setBias] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const runSmooth = useCallback(() => {
    const t = targetBias.current;
    const s = smoothBias.current;
    const next = s + (t - s) * 0.22;
    smoothBias.current = Math.abs(t - next) < 0.0008 ? t : next;
    setBias(smoothBias.current);
    if (Math.abs(targetBias.current - smoothBias.current) > 0.002) {
      rafRef.current = requestAnimationFrame(runSmooth);
    } else {
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const kickRaf = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(runSmooth);
    }
  }, [runSmooth]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / Math.max(r.width, 1);
    targetBias.current = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    kickRaf();
  };

  const onPointerEnter = () => {
    kickRaf();
  };

  const onPointerLeave = () => {
    setHovered(null);
    targetBias.current = 0;
    kickRaf();
  };

  const n = stack.length;
  const centerFloat =
    n <= 1 ? 0 : (n - 1) / 2 + bias * Math.max((n - 1) / 2, 0.35);

  return (
    <div
      ref={wrapRef}
      className="relative isolate min-h-[min(440px,72vw)] w-full sm:min-h-[460px]"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 45%" }}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
    >
      <p className="pointer-events-none absolute left-1/2 top-2 z-[200] -translate-x-1/2 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#EB523F]">
        Move cursor — stack reacts
      </p>

      <div
        className="relative mx-auto flex h-[min(440px,72vw)] w-full max-w-5xl items-center justify-center sm:h-[460px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {stack.map(({ item, key }, i) => {
          const d = i - centerFloat;
          const abs = Math.abs(d);
          const spread = 76;
          const tx = d * spread + bias * 36;
          const tz = -abs * 28;
          const rotY = d * -7 + bias * -8;
          const rotX = bias * -5 + d * 1.2;
          const isHover = hovered === i;
          const scaleBase = 1.05 - Math.min(abs, 2.8) * 0.07;
          const scale = isHover ? Math.max(scaleBase, 1.12) + 0.1 : scaleBase;
          const z = 80 - Math.round(abs * 14) + (isHover ? 25 : 0);

          return (
            <article
              key={key}
              className="absolute w-[min(100%,320px)] will-change-transform"
              style={{
                zIndex: z,
                transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
                transformStyle: "preserve-3d",
                transition: `transform 0.32s ${ELASTIC}, box-shadow 0.22s ${ELASTIC}`,
                boxShadow: isHover ? SHADOW_HOVER : SHADOW_IDLE,
              }}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              <div
                className="flex gap-4 rounded-2xl border-[3px] border-[#161015] bg-[#EEEDEE] p-5"
                style={{
                  boxShadow: "inset 0 0 0 2px #EA3699",
                }}
              >
                <PersonIcon />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black uppercase tracking-wide text-[#EB523F]">
                    {item.reviewer}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm font-semibold leading-snug text-[#161015]">
                    {item.message}
                  </p>
                  <p className="mt-3 text-lg font-black tracking-widest text-[#AAE847]">
                    {"★".repeat(Math.min(5, Math.max(1, Math.round(item.rating))))}
                    <span className="ml-2 align-middle text-xs font-bold text-[#EA3699]">
                      {item.rating}/5
                    </span>
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

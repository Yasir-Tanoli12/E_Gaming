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
      className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full border-[3px] border-[#EB523F] bg-gradient-to-br from-[#EA3699] to-[#EB523F] shadow-[4px_4px_0_#161015] sm:h-[4.5rem] sm:w-[4.5rem]"
      aria-hidden
    >
      <svg className="h-8 w-8 text-[#EEEDEE] sm:h-9 sm:w-9" fill="currentColor" viewBox="0 0 24 24">
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

type DragState = { pointerId: number; startX: number; startBias: number };

export function InteractiveReviewCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const stack = useMemo(() => buildStack(reviews), [reviews]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const targetBias = useRef(0);
  const smoothBias = useRef(0);
  const rafRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
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

  const applyBias = useCallback((value: number, snapSmooth = false) => {
    const v = Math.max(-1, Math.min(1, value));
    targetBias.current = v;
    if (snapSmooth) {
      smoothBias.current = v;
      setBias(v);
    } else {
      kickRaf();
    }
  }, [kickRaf]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startBias: targetBias.current,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(r.width, 1);

    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      const dx = e.clientX - drag.startX;
      const next = drag.startBias + (dx / w) * 2.85;
      applyBias(next, true);
      return;
    }

    if (e.pointerType === "mouse") {
      const x = (e.clientX - r.left) / w;
      targetBias.current = Math.max(-1, Math.min(1, (x - 0.5) * 2));
      kickRaf();
    }
  };

  const onPointerEnter = () => {
    kickRaf();
  };

  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setHovered(null);
    if (e.pointerType === "mouse") {
      targetBias.current = 0;
      kickRaf();
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
    }
    setHovered(null);
  };

  const n = stack.length;
  const centerFloat =
    n <= 1 ? 0 : (n - 1) / 2 + bias * Math.max((n - 1) / 2, 0.35);

  return (
    <div
      ref={wrapRef}
      className="relative isolate min-h-[min(480px,70vw)] w-full touch-none px-2 sm:min-h-[580px] sm:touch-auto sm:px-4"
      style={{ perspective: "1400px", perspectiveOrigin: "50% 42%" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <p className="pointer-events-none absolute left-1/2 top-2 z-[200] hidden -translate-x-1/2 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#EB523F] lg:block">
        Move cursor — stack reacts
      </p>

      <div
        className="relative mx-auto flex h-[min(480px,70vw)] w-full max-w-[90rem] items-center justify-center sm:h-[580px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {stack.map(({ item, key }, i) => {
          const d = i - centerFloat;
          const abs = Math.abs(d);
          const spread = 118;
          const tx = d * spread + bias * 22;
          const tz = -abs * 12;
          const rotY = d * -4 + bias * -5;
          const rotX = bias * -3 + d * 0.8;
          const isHover = hovered === i;
          const scaleBase = 1.08 - Math.min(abs, 3.2) * 0.042;
          const scale = isHover ? Math.max(scaleBase, 1.12) + 0.1 : scaleBase;
          const z = 100 - Math.round(abs * 11) + (isHover ? 28 : 0);

          return (
            <article
              key={key}
              className="absolute w-[min(100%,400px)] will-change-transform sm:w-[min(100%,440px)]"
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
                className="flex gap-5 rounded-2xl border-[3px] border-[#161015] bg-[#EEEDEE] p-6 sm:gap-6 sm:p-7"
                style={{
                  boxShadow: "inset 0 0 0 2px #EA3699",
                }}
              >
                <PersonIcon />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black uppercase tracking-wide text-[#EB523F] sm:text-xl">
                    {item.reviewer}
                  </p>
                  <p className="mt-2 line-clamp-4 text-base font-semibold leading-snug text-[#161015] sm:text-[1.05rem]">
                    {item.message}
                  </p>
                  <p className="mt-3 text-xl font-black tracking-widest text-[#AAE847] sm:text-2xl">
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

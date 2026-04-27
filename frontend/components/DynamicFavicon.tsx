"use client";

import { useEffect } from "react";

const STORAGE_KEY = "sweepstown:favicon-logo";
const DEFAULT_ICON = "/favicon.svg";

type Stored = { logoUrl: string; updatedAt: string };

function getIconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>("link#dynamic-favicon");
  if (link) return link;
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (existing) {
    existing.id = "dynamic-favicon";
    return existing;
  }
  link = document.createElement("link");
  link.id = "dynamic-favicon";
  link.rel = "icon";
  document.head.appendChild(link);
  return link;
}

function applyIconHref(logoUrl: string) {
  const link = getIconLink();
  const normalized = (() => {
    try {
      return new URL(logoUrl, window.location.origin).href;
    } catch {
      return logoUrl;
    }
  })();
  if (link.href === normalized) return;
  link.href = logoUrl;
}

export function DynamicFavicon() {
  useEffect(() => {
    function readCache(): Stored | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<Stored>;
        if (typeof parsed.logoUrl === "string" && parsed.logoUrl) {
          return { logoUrl: parsed.logoUrl, updatedAt: parsed.updatedAt ?? "" };
        }
      } catch {
        return null;
      }
      return null;
    }

    const cached = readCache();
    if (cached) {
      try {
        applyIconHref(cached.logoUrl);
      } catch {
        // ignore
      }
    }

    async function fetchAndApply() {
      try {
        const res = await fetch("/api/logo", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          logoUrl?: string | null;
          updatedAt?: string;
        };
        if (data.logoUrl) {
          applyIconHref(data.logoUrl);
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                logoUrl: data.logoUrl,
                updatedAt: data.updatedAt ?? "",
              } satisfies Stored)
            );
          } catch {
            // ignore
          }
        } else {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
          applyIconHref(DEFAULT_ICON);
        }
      } catch (err) {
        console.error("Failed to load logo:", err);
      }
    }

    void fetchAndApply();

    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchAndApply();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(
      () => void fetchAndApply(),
      5 * 60 * 1000
    );
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}

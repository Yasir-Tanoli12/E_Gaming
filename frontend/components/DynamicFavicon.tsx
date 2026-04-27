"use client";

import { useEffect } from "react";
import { withFaviconCacheBuster } from "@/lib/favicon-url";
import { resolveUploadMediaUrl } from "@/lib/media-url";

const STORAGE_KEY = "sweepstown:favicon-logo";
const DEFAULT_ICON = "/favicon.svg";

type Stored = { logoUrl: string; updatedAt: string };

function isAppleTouchIcon(el: HTMLLinkElement): boolean {
  const rel = (el.getAttribute("rel") ?? "").toLowerCase();
  return rel.includes("apple-touch");
}

/**
 * Set every `link[rel=*icon]` the browser may use for the tab (not Apple touch).
 */
function setTabFaviconHref(absoluteHref: string) {
  const all = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
  let any = false;
  for (const el of all) {
    if (isAppleTouchIcon(el)) continue;
    any = true;
    el.removeAttribute("sizes");
    if (el.href !== absoluteHref) {
      el.href = absoluteHref;
    }
  }
  if (!any) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = absoluteHref;
    document.head.appendChild(link);
  }
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
        const resolved = resolveUploadMediaUrl(cached.logoUrl) ?? cached.logoUrl;
        setTabFaviconHref(
          withFaviconCacheBuster(resolved, cached.updatedAt)
        );
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
          const href = withFaviconCacheBuster(
            data.logoUrl,
            data.updatedAt ?? ""
          );
          setTabFaviconHref(href);
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
          setTabFaviconHref(
            new URL(DEFAULT_ICON, window.location.origin).href
          );
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

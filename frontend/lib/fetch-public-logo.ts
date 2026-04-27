import { getApiBaseUrl } from "./api";
import { resolveUploadMediaUrl } from "./media-url";
import { withFaviconCacheBuster } from "./favicon-url";

export type PublicLogo = { logoUrl: string | null; updatedAt: string };

/**
 * Fetches public logo for server metadata (root layout). Uses no-store so the
 * tab icon in HTML matches the current backend value instead of a build-time default.
 */
export async function fetchPublicLogoForMetadata(): Promise<{
  iconHref: string;
  isFallback: boolean;
}> {
  let base: string;
  try {
    base = getApiBaseUrl();
  } catch {
    return { iconHref: "/favicon.svg", isFallback: true };
  }

  let raw: PublicLogo;
  try {
    const res = await fetch(`${base}/content/logo`, { cache: "no-store" });
    if (!res.ok) {
      return { iconHref: "/favicon.svg", isFallback: true };
    }
    raw = (await res.json()) as PublicLogo;
  } catch {
    return { iconHref: "/favicon.svg", isFallback: true };
  }

  if (!raw.logoUrl) {
    return { iconHref: "/favicon.svg", isFallback: true };
  }

  const resolved = resolveUploadMediaUrl(raw.logoUrl);
  if (!resolved) {
    return { iconHref: "/favicon.svg", isFallback: true };
  }

  return {
    iconHref: withFaviconCacheBuster(resolved, raw.updatedAt),
    isFallback: false,
  };
}

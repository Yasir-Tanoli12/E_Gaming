import { getApiBaseUrl } from "./api";

/**
 * Browser origin for `/uploads/...` assets.
 * Must not append to the full API base when that includes a path (e.g. `https://site.com/api`),
 * or relative DB paths like `/uploads/games/x.png` become `.../api/uploads/...` and 404.
 * Set `NEXT_PUBLIC_PUBLIC_UPLOADS_URL` when uploads are served from a different host than the API origin.
 */
function getUploadsOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_PUBLIC_UPLOADS_URL?.trim();
  if (explicit) {
    let parsed: URL;
    try {
      parsed = new URL(explicit);
    } catch {
      throw new Error(
        "Invalid NEXT_PUBLIC_PUBLIC_UPLOADS_URL. Use a full URL like https://sweepstown.com"
      );
    }
    if (
      process.env.NODE_ENV === "production" &&
      (parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1")
    ) {
      throw new Error(
        `Invalid NEXT_PUBLIC_PUBLIC_UPLOADS_URL for production: ${explicit}. Do not use localhost.`
      );
    }
    return parsed.origin;
  }

  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return getApiBaseUrl().replace(/\/+$/, "");
  }
}

/**
 * Resolves game / lobby / branding media for the browser.
 * - Relative `/uploads/...` → `origin(NEXT_PUBLIC_PUBLIC_UPLOADS_URL || NEXT_PUBLIC_API_URL) + path`.
 * - Absolute URLs under `/uploads/` → same origin rewrite (fixes localhost rows and path-prefixed API bases).
 * - Other absolute URLs (e.g. external thumbnails) → unchanged.
 */
export function resolveUploadMediaUrl(url: string | null | undefined): string | null {
  const s = url?.trim() ?? "";
  if (!s) return null;
  const uploadsOrigin = getUploadsOrigin();
  try {
    if (s.startsWith("http://") || s.startsWith("https://")) {
      const u = new URL(s);
      if (u.pathname.includes("/uploads/")) {
        return `${uploadsOrigin}${u.pathname}${u.search}`;
      }
      return s;
    }
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${uploadsOrigin}${path}`;
  } catch {
    if (s.startsWith("http")) return s;
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${uploadsOrigin}${path}`;
  }
}

import { getApiBaseUrl } from "./api";

/**
 * Resolves game / lobby / branding media for the browser.
 * - Relative `/uploads/...` → prefixed with `NEXT_PUBLIC_API_URL` (or dev default).
 * - Absolute URLs whose path is under `/uploads/` → origin replaced with the API base
 *   (fixes rows saved as `http://localhost:3001/...` on production).
 * - Other absolute URLs (e.g. external thumbnails) → unchanged.
 */
export function resolveUploadMediaUrl(url: string | null | undefined): string | null {
  const s = url?.trim() ?? "";
  if (!s) return null;
  const base = getApiBaseUrl().replace(/\/+$/, "");
  try {
    if (s.startsWith("http://") || s.startsWith("https://")) {
      const u = new URL(s);
      if (u.pathname.includes("/uploads/")) {
        const b = new URL(base);
        return `${b.origin}${u.pathname}${u.search}`;
      }
      return s;
    }
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${base}${path}`;
  } catch {
    return s.startsWith("http") ? s : `${base}${s.startsWith("/") ? s : `/${s}`}`;
  }
}

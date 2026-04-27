/**
 * Browsers cache favicons aggressively. Append a stable version token so
 * the tab icon refreshes when the file at the same path is replaced.
 */
export function withFaviconCacheBuster(
  logoUrl: string,
  updatedAt: string | null | undefined
): string {
  if (!updatedAt) return logoUrl;
  try {
    const u = new URL(logoUrl);
    u.searchParams.set("v", updatedAt);
    return u.toString();
  } catch {
    const sep = logoUrl.includes("?") ? "&" : "?";
    return `${logoUrl}${sep}v=${encodeURIComponent(updatedAt)}`;
  }
}

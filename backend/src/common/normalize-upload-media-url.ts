/**
 * Turn stored game media paths into absolute URLs the browser can load.
 * Fixes: DB has `/uploads/...` or `http://localhost:.../uploads/...` while public files live on another origin.
 * Prefer PUBLIC_UPLOADS_URL when API is under `/api` but `/uploads` is served from the site root.
 */
function getUploadsRewriteOrigin(): string | undefined {
  const uploads = process.env.PUBLIC_UPLOADS_URL?.trim().replace(/\/+$/, '');
  if (uploads) {
    try {
      return new URL(uploads).origin;
    } catch {
      return undefined;
    }
  }
  const base =
    process.env.API_URL?.trim().replace(/\/+$/, '') ||
    process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!base) return undefined;
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

export function normalizeUploadMediaUrl(url: string | null | undefined): string | null {
  const s = url?.trim() ?? '';
  if (!s) return null;
  const origin = getUploadsRewriteOrigin();
  if (!origin) {
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    return s.startsWith('/') ? s : `/${s}`;
  }
  try {
    if (s.startsWith('http://') || s.startsWith('https://')) {
      const u = new URL(s);
      if (u.pathname.includes('/uploads/')) {
        return `${origin}${u.pathname}${u.search}`;
      }
      return s;
    }
    const path = s.startsWith('/') ? s : `/${s}`;
    return `${origin}${path}`;
  } catch {
    return s.startsWith('http') ? s : `${origin}${s.startsWith('/') ? s : `/${s}`}`;
  }
}

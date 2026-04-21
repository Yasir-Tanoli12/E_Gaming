/**
 * Turn stored game media paths into absolute URLs the browser can load from the API host.
 * Fixes: DB has `/uploads/...` or `http://localhost:.../uploads/...` while the site uses another domain.
 */
export function normalizeUploadMediaUrl(url: string | null | undefined): string | null {
  const s = url?.trim() ?? '';
  if (!s) return null;
  const base =
    process.env.API_URL?.trim().replace(/\/+$/, '') ||
    process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!base) {
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    return s.startsWith('/') ? s : `/${s}`;
  }
  try {
    const origin = new URL(base).origin;
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
    return s.startsWith('http') ? s : `${base}${s.startsWith('/') ? s : `/${s}`}`;
  }
}

import type { Request } from 'express';

/**
 * Public origin for absolute URLs (uploads, media). Prefer API_URL when the app sits behind a reverse proxy.
 */
export function getPublicApiOrigin(req: Request): string {
  const fromEnv = process.env.API_URL?.trim() || process.env.PUBLIC_API_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/$/, '');
    }
  }
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto =
    (typeof protoHeader === 'string' ? protoHeader : protoHeader?.[0])
      ?.split(',')[0]
      ?.trim() || req.protocol;
  const hostHeader = req.headers['x-forwarded-host'];
  const host =
    (typeof hostHeader === 'string' ? hostHeader : hostHeader?.[0])
      ?.split(',')[0]
      ?.trim() ||
    req.get('host') ||
    'localhost:3001';
  return `${proto}://${host}`.replace(/\/$/, '');
}

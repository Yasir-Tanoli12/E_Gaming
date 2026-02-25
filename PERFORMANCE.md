# Performance Optimization Guide

This document outlines the performance optimizations applied to the CashlySweeps full-stack application and recommendations for production deployment.

---

## Frontend (Next.js)

### Implemented

- **Production build optimizations**: `reactStrictMode`, `compress: true`, `poweredByHeader: false`
- **Image optimization**: `next/image` with `OptimizedImage` component for backend uploads; AVIF/WebP formats; automatic lazy loading
- **Font optimization**: `display: "swap"` and `preload: true` for Geist fonts to reduce CLS
- **Package optimization**: `optimizePackageImports` for `@/components` to reduce bundle size
- **Remote image patterns**: `remotePatterns` configured for `NEXT_PUBLIC_API_URL` uploads

### Recommendations

- **Bundle analysis**: Run `ANALYZE=true npm run build` (add `@next/bundle-analyzer` to analyze bundle size)
- **Dynamic imports**: Use `next/dynamic` for heavy admin components or below-the-fold content
- **SSG/ISR**: For `/about-us` and `/privacy-policy`, consider server components with `fetch` + `revalidate` if content can be stale for 60s+
- **Lighthouse**: Target 90+ by ensuring Core Web Vitals (LCP, FID, CLS); avoid heavy client-side JS on first paint

---

## Backend (NestJS)

### Implemented

- **Response compression**: Gzip via `compression` middleware (reduces payload size ~70%)
- **In-memory caching**: `@nestjs/cache-manager` for public endpoints
  - Games list: 60s TTL, invalidated on create/update/delete
  - Content: 60s TTL, invalidated on any content update
- **HTTP caching headers**: `Cache-Control: public, max-age=60, s-maxage=120` on:
  - `GET /games` – games list
  - `GET /games/top` – top games
  - `GET /content/public` – public content
  - `GET /news/current` – current news poster
- **Prisma select optimization**: Only required columns fetched for blogs, reviews, privacy policy
- **Rate limiting**: ThrottlerGuard (100 req/min)

### Recommendations

- **Pagination**: Add `?page=1&limit=20` for blogs, FAQs, reviews if list grows large
- **ETag**: Add `ETag` header for conditional requests on public content
- **Production logging**: Reduce logging level in production (`NODE_ENV=production`)

---

## Database (Supabase / PostgreSQL)

### Implemented

- **Indexes** (Prisma schema):
  - `Game`: `@@index([isActive, sortOrder])`, `@@index([isActive, id])`
  - `NewsPoster`: `@@index([isActive])`
  - `Blog`: `@@index([createdAt(sort: Desc)])`
  - `Faq`: `@@index([createdAt(sort: Desc)])`
  - `Review`: `@@index([isFeatured, createdAt(sort: Desc)])`

### Migration

Run the migration to apply indexes:

```bash
cd backend && npx prisma migrate dev --name add_performance_indexes
```

### Recommendations

- **Connection pooling**: Supabase pooler URL (`:6543`) is used; ensure `connection_limit` is appropriate for your plan
- **N+1 prevention**: Content service uses sequential `withPoolRetry` wrapped queries; no N+1 in current patterns
- **Row-level security**: If Supabase RLS is enabled, ensure indexes don’t conflict with policy checks

---

## Network & Architecture

### CDN Strategy

- **Static assets**: Serve `/uploads` (images, videos) via CDN (e.g. Cloudflare, Vercel Edge)
- **API**: Cache `GET /games`, `GET /content/public`, `GET /news/current` at edge (s-maxage=120)
- **Frontend**: Deploy Next.js to Vercel (or similar) for automatic edge caching and ISR

### TTFB

- Reduce TTFB by:
  - Caching public API responses (implemented)
  - Using database indexes (implemented)
  - Keeping response payloads small (compression + select)

### HTTP/2 & HTTP/3

- Most hosting (Vercel, Cloudflare, Railway) enables HTTP/2 by default
- Enable HTTP/3 (QUIC) if supported by your hosting provider

### Monitoring

- **APM**: Consider Datadog, New Relic, or Sentry for backend and frontend
- **Uptime**: UptimeRobot, Better Uptime, or Pingdom
- **Lighthouse CI**: Run in CI to catch regressions

---

## Quick Checklist

- [ ] Run `npm install` in backend (compression, cache-manager)
- [ ] Run `npx prisma migrate dev` to apply indexes
- [ ] Configure `NEXT_PUBLIC_API_URL` for production
- [ ] Configure CDN for `/uploads` if applicable
- [ ] Set `NODE_ENV=production` for backend
- [ ] Run Lighthouse audit and target 90+ performance score

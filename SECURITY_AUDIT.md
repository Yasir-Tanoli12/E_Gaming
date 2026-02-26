# Security Audit Report – E_Gaming

**Date:** February 2025  
**Scope:** Next.js frontend, NestJS backend, Supabase/Prisma

---

## Executive Summary

An enterprise-level security audit was performed. All identified vulnerabilities were addressed without removing features or breaking functionality.

---

## 1. Frontend (Next.js + React)

### 1.1 Token Storage – FIXED

**Vulnerability:** JWT and refresh tokens were stored in `localStorage`, exposing them to XSS.

**Fix:** Switched to httpOnly cookies:
- Backend sets `eg_access_token` and `eg_refresh_token` as httpOnly cookies
- Cookies use `Secure` in production, `SameSite=Lax`
- Frontend uses `credentials: 'include'` on all API calls
- Removed `auth-storage.ts` and all localStorage usage for tokens

### 1.2 Security Headers – IMPLEMENTED

**Fix:** Added Next.js middleware with:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (CSP) with connect-src scoped to API URL

### 1.3 XSS

**Status:** No `dangerouslySetInnerHTML` usage found. React’s default escaping is used.

### 1.4 Environment Variables

**Status:** Only `NEXT_PUBLIC_API_URL` is exposed. No sensitive keys in frontend.

### 1.5 CORS

**Status:** Backend CORS is configured with a single origin (`FRONTEND_URL`).

---

## 2. Backend (NestJS)

### 2.1 JWT Secret – FIXED

**Vulnerability:** Fallback secret `'fallback-dev-secret'` when `JWT_SECRET` was missing.

**Fix:** Joi-based env validation; `JWT_SECRET` is required in production (min 32 chars).

### 2.2 Refresh Token Validation – FIXED

**Vulnerability:** Refresh endpoint accepted unvalidated `refreshToken` from body.

**Fix:** Added `RefreshTokenDto` with validation; refresh token read from cookie first, then body.

### 2.3 Error Handling – FIXED

**Vulnerability:** Stack traces could be exposed in error responses.

**Fix:** Added `HttpExceptionFilter` that hides stack traces in production.

### 2.4 Password Hashing – VERIFIED

**Status:** bcrypt with 12 rounds for registration and password reset. Seed updated from 10 to 12 rounds.

### 2.5 Validation – ENHANCED

**Status:** `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`. Added `@Trim()` decorator for string sanitization on auth and content DTOs.

### 2.6 Auth Guards – VERIFIED

**Status:** `JwtAuthGuard` (global) + `RolesGuard` + `@Roles(UserRole.ADMIN)` on admin routes. `@Public()` for unauthenticated endpoints.

### 2.7 Rate Limiting – VERIFIED

**Status:** `ThrottlerModule` (100 req/min global), 10 req/min for auth endpoints.

### 2.8 Helmet – VERIFIED

**Status:** Helmet enabled with `crossOriginResourcePolicy: 'cross-origin'` for static assets.

### 2.9 File Upload – VERIFIED

**Status:** MIME type whitelist, 100MB limit, randomized filenames.

---

## 3. Supabase / Database

### 3.1 Architecture

**Status:** Prisma ORM only; no direct Supabase client. Access control via NestJS guards.

### 3.2 Service Role Key

**Status:** No Supabase service role key in codebase. DB access via `DATABASE_URL`.

### 3.3 RLS

**Status:** Access control enforced in NestJS. If Supabase RLS is enabled, policies should align with backend roles.

---

## 4. Infrastructure & Deployment

### 4.1 Credentials – FIXED

**Vulnerability:** `.env.example` contained a real SMTP API key.

**Fix:** Replaced with placeholder `your-resend-api-key-placeholder`.

### 4.2 Cookie Flags

**Status:** httpOnly, Secure (production), SameSite=Lax, Path=/.

### 4.3 Environment Validation

**Status:** Joi schema validates required vars on startup.

---

## 5. OWASP Top 10 Coverage

| Risk | Mitigation |
|------|------------|
| Broken Access Control | JwtAuthGuard, RolesGuard, @Public() |
| Cryptographic Failures | bcrypt 12 rounds, JWT with strong secret |
| Injection | Prisma ORM, DTO validation, @Trim() |
| Insecure Design | Auth flow, rate limiting, brute-force lockout |
| Security Misconfiguration | Helmet, CSP, security headers |
| Vulnerable Components | Run `npm audit` regularly |
| Auth Failures | httpOnly cookies, refresh token rotation |
| Data Integrity | DTO validation, file type validation |
| Logging | AuthLog for sign-in/sign-up events |
| SSRF | No user-controlled URLs in server requests |

---

## 6. Files Changed

### Backend
- `main.ts` – cookie-parser, HttpExceptionFilter
- `app.module.ts` – ConfigModule validate
- `auth/auth.controller.ts` – RefreshTokenDto, AuthCookiesInterceptor, logout
- `auth/auth.module.ts` – JWT secret from config
- `auth/jwt.strategy.ts` – JWT from cookie or Authorization header
- `auth/dto/refresh-token.dto.ts` – new
- `auth/auth-cookies.interceptor.ts` – new
- `config/env.validation.ts` – new (Joi)
- `common/http-exception.filter.ts` – new
- `common/sanitize.decorator.ts` – new
- `prisma/seed.ts` – bcrypt 12 rounds
- `.env.example` – removed real SMTP key

### Frontend
- `lib/api.ts` – credentials: 'include', removed getAuthHeaders token logic
- `lib/auth-api.ts` – refresh() no body, logout()
- `lib/auth-storage.ts` – removed
- `lib/content-api.ts` – credentials: 'include' on fetch
- `lib/games-api.ts` – credentials: 'include' on fetch
- `contexts/AuthContext.tsx` – cookie-based auth, logout calls API
- `middleware.ts` – new (security headers)

---

## 7. Recommendations

1. Run `npm audit fix` and review remaining advisories.
2. Use HTTPS in production; consider HSTS header.
3. Rotate `JWT_SECRET` if it may have been exposed.
4. If adding user-generated HTML, use a sanitization library (e.g. DOMPurify).
5. Add CSRF tokens if supporting non-cookie auth or form-based flows.

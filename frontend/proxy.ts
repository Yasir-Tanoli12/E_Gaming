import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessCookie = Boolean(request.cookies.get("eg_access_token")?.value);

  if (pathname.startsWith("/admin") && !hasAccessCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasAccessCookie) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  const res = NextResponse.next();

  const securityHeaders: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-XSS-Protection": "1; mode=block",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const connectSrcParts = new Set<string>(["'self'", "https:", "wss:"]);
  if (process.env.NODE_ENV !== "production") {
    connectSrcParts.add("http://localhost:3001");
  }
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      connectSrcParts.add(`${u.protocol}//${u.host}`);
      if (u.protocol === "https:") {
        connectSrcParts.add(`wss://${u.host}`);
      }
    } catch {
      /* ignore invalid API URL */
    }
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl);
      connectSrcParts.add(`${u.protocol}//${u.host}`);
      if (u.protocol === "https:") {
        connectSrcParts.add(`wss://${u.host}`);
      }
    } catch {
      /* ignore invalid URL */
    }
  }
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    `connect-src ${Array.from(connectSrcParts).join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  securityHeaders["Content-Security-Policy"] = cspDirectives.join("; ");

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

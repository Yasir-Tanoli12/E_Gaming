import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api";
import { resolveUploadMediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";

type LogoPayload = { logoUrl: string | null; updatedAt: string };

/**
 * Public JSON for the site logo — proxied from the API so the browser can
 * `fetch("/api/logo")` same-origin without CORS to the backend.
 * `logoUrl` is normalized like other upload media (correct host for `/uploads/...`).
 */
export async function GET() {
  let base: string;
  try {
    base = getApiBaseUrl();
  } catch {
    const fallback: LogoPayload = {
      logoUrl: null,
      updatedAt: new Date(0).toISOString(),
    };
    return NextResponse.json(fallback);
  }

  try {
    const res = await fetch(`${base}/content/logo`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const fallback: LogoPayload = {
        logoUrl: null,
        updatedAt: new Date(0).toISOString(),
      };
      return NextResponse.json(fallback);
    }
    const data = (await res.json()) as LogoPayload;
    const logoUrl = data.logoUrl
      ? resolveUploadMediaUrl(data.logoUrl)
      : null;
    const out: LogoPayload = {
      logoUrl,
      updatedAt: data.updatedAt,
    };
    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    const fallback: LogoPayload = {
      logoUrl: null,
      updatedAt: new Date(0).toISOString(),
    };
    return NextResponse.json(fallback);
  }
}

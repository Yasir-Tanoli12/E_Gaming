"use client";

import Image from "next/image";
import { getApiBaseUrl } from "@/lib/api";
import { resolveUploadMediaUrl } from "@/lib/media-url";

function isUploadUrl(src: string): boolean {
  const base = getApiBaseUrl();
  return src.startsWith(base) && src.includes("/uploads/");
}

function isLocalhost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

interface OptimizedImageProps
  extends Omit<React.ComponentProps<typeof Image>, "src"> {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

/**
 * Uses next/image for backend upload URLs (auto WebP/AVIF, lazy load).
 * Falls back to native img for external URLs not in remotePatterns.
 */
export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
  ...rest
}: OptimizedImageProps) {
  const resolved = resolveUploadMediaUrl(src);
  if (!resolved) {
    return null;
  }

  if (isUploadUrl(resolved) && !isLocalhost(resolved)) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={className}
        loading={priority ? "eager" : "lazy"}
        {...rest}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}

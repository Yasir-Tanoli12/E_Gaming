"use client";

import Image from "next/image";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function isUploadUrl(src: string): boolean {
  const base = getBaseUrl();
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
  if (!src) {
    return null;
  }

  if (isUploadUrl(src) && !isLocalhost(src)) {
    return (
      <Image
        src={src}
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
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}

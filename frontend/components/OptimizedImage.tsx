"use client";

import { resolveUploadMediaUrl } from "@/lib/media-url";

/**
 * Renders upload / remote images with a plain &lt;img&gt; so the browser loads the URL directly.
 * Avoids `next/image` (/_next/image?url=…) which returns 400 unless every host is listed in remotePatterns.
 */
export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  /** Kept for API compatibility; native img ignores it unless you add srcSet later. */
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes: _sizes,
  priority = false,
  className = "",
  ...rest
}: OptimizedImageProps) {
  const resolved = resolveUploadMediaUrl(src);
  if (!resolved) {
    return null;
  }

  const fillClass = fill ? "absolute inset-0 h-full w-full" : "";
  const mergedClass = [fillClass, className].filter(Boolean).join(" ");

  return (
    <img
      src={resolved}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={mergedClass || undefined}
      {...rest}
    />
  );
}

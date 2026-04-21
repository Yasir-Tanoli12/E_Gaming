import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Directory containing this file — always `frontend/`, unlike `process.cwd()` when dev is run from the repo root */
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const tailwindRoot = path.join(frontendRoot, "node_modules", "tailwindcss");
const tailwindPostcssRoot = path.join(
  frontendRoot,
  "node_modules",
  "@tailwindcss",
  "postcss",
);

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const apiParsed = new URL(apiUrl);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
let supabaseHostPattern: { protocol: "https"; hostname: string; port: string; pathname: string } | null =
  null;
if (supabaseUrl) {
  try {
    const u = new URL(supabaseUrl);
    supabaseHostPattern = {
      protocol: "https",
      hostname: u.hostname,
      port: u.port || "",
      pathname: "/**",
    };
  } catch {
    supabaseHostPattern = null;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  /**
   * Dev (`next dev`) uses Turbopack by default; it was resolving `@import "tailwindcss"`
   * from the repo parent (no package.json there). Aliases match production/webpack behavior.
   */
  turbopack: {
    root: frontendRoot,
    resolveAlias: {
      tailwindcss: tailwindRoot,
      "@tailwindcss/postcss": tailwindPostcssRoot,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    const alias = config.resolve.alias ?? {};
    if (typeof alias === "object" && !Array.isArray(alias)) {
      config.resolve.alias = {
        ...alias,
        tailwindcss: tailwindRoot,
        "@tailwindcss/postcss": tailwindPostcssRoot,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: apiParsed.protocol.replace(":", "") as "http" | "https",
        hostname: apiParsed.hostname,
        port: apiParsed.port || "",
        pathname: "/uploads/**",
      },
      // Storage / any code still using next/image against Supabase
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/**",
      },
      ...(supabaseHostPattern ? [supabaseHostPattern] : []),
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;

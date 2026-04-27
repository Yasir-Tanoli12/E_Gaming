import type { Metadata } from "next";
import { Anton, Bungee, Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppQueryProvider } from "@/components/AppQueryProvider";
import { ConditionalSiteFooter } from "@/components/ConditionalSiteFooter";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { fetchPublicLogoForMetadata } from "@/lib/fetch-public-logo";
import "./globals.css";

function iconTypeFromUrl(href: string): string | undefined {
  const path = href.split("?")[0].toLowerCase();
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".gif")) return "image/gif";
  return undefined;
}

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const { iconHref, isFallback } = await fetchPublicLogoForMetadata();
  const type = isFallback ? "image/svg+xml" : iconTypeFromUrl(iconHref);
  return {
    title: "SWEEPSTOWN",
    description: "SWEEPSTOWN platform",
    icons: {
      icon: type
        ? [{ url: iconHref, type }]
        : [{ url: iconHref }],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${anton.variable} ${bungee.variable} ${geistMono.variable} min-w-0 antialiased`}
      >
        <DynamicFavicon />
        <AuthProvider>
          <AppQueryProvider>
            {children}
            <ConditionalSiteFooter />
          </AppQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

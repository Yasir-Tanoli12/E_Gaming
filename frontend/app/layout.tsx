import type { Metadata } from "next";
import { Anton, Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConditionalSiteFooter } from "@/components/ConditionalSiteFooter";
import "./globals.css";

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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "SWEEPSTOWN",
  description: "SWEEPSTOWN platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${anton.variable} ${geistMono.variable} min-w-0 antialiased`}
      >
        <AuthProvider>
          {children}
          <ConditionalSiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Anton, Bungee, Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppQueryProvider } from "@/components/AppQueryProvider";
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
        className={`${poppins.variable} ${anton.variable} ${bungee.variable} ${geistMono.variable} min-w-0 antialiased`}
      >
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

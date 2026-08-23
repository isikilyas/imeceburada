import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/google-analytics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "İmece Burada";
const DESCRIPTION = "İnşaat sektörüne özel iş ilanları ve İnşaat Pazaryeri platformu.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  manifest: "/manifest.json",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "İmece Burada",
    images: [{ url: "/logo.png", width: 897, height: 249, alt: "İmece Burada" }],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="blueprint-grid min-h-screen">
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

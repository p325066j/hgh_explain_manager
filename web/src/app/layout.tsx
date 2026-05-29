import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  applicationName: "HGH Explain Manager",
  metadataBase: new URL("https://hgh-explain.example"),
  title: {
    default: "HGH Explain Manager",
    template: "%s | HGH Explain Manager",
  },
  description:
    "医療機関向けの検査・治療説明動画を管理し、スタッフ運用と患者視聴を支援するSaaSプラットフォーム。",
  keywords: [
    "医療動画",
    "患者説明",
    "検査説明",
    "治療説明",
    "HGH Explain Manager",
  ],
  openGraph: {
    title: "HGH Explain Manager",
    description:
      "検査・治療説明動画の管理とカテゴリ整理を支援する医療機関向けSaaS。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "HGH Explain Manager",
    description:
      "検査・治療説明動画の運用を支援する医療機関向けSaaSプラットフォーム。",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#dfdfdf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

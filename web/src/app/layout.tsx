import type { Metadata } from "next";
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
  metadataBase: new URL("https://hgh-explain.example"),
  title: {
    default: "HGH Explain Manager",
    template: "%s | HGH Explain Manager",
  },
  description:
    "医療機関向け検査・治療説明動画を一元管理し、スタッフと患者双方の体験を高める院内SaaSプラットフォームです。",
  keywords: ["医療向けSaaS", "動画説明", "業務効率化", "患者体験", "HGH Explain Manager"],
  openGraph: {
    title: "HGH Explain Manager",
    description: "検査・治療説明動画のライブラリ管理とカテゴリ編成、患者向け配信をワンストップで提供します。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "HGH Explain Manager",
    description: "医療スタッフの説明業務を動画で標準化する院内SaaSプラットフォームです。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hgh-explain.example"),
  title: {
    default: "HGH Explain Manager",
    template: "%s | HGH Explain Manager",
  },
  description:
    "医療機関向け検査・治療説明動画を一元管理し、スタッフと患者の体験を改善する院内 SaaS プラットフォーム。",
  keywords: [
    "医療",
    "動画説明",
    "スタッフ業務効率化",
    "患者体験",
    "HGH Explain Manager",
  ],
  openGraph: {
    title: "HGH Explain Manager",
    description:
      "検査・治療説明動画のライブラリ管理、カテゴリ編成、患者向け再生をワンストップで提供。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "HGH Explain Manager",
    description:
      "医療スタッフの説明業務を動画で標準化する院内 SaaS プラットフォーム。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { GoogleTagManager } from "@next/third-parties/google";
import { BackgroundBubbles } from "@/components/layout/BackgroundBubbles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beer-link.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beer Link - 知って繋がる、ビールの楽しさ",
    template: "%s | Beer Link",
  },
  description:
    "クラフトビールの情報・レビューが集まるファンサイト。ビール、ブルワリー、ビアスタイルの一覧と口コミ投稿機能を提供します。",
  keywords: ["クラフトビール", "ビール", "ブルワリー", "レビュー", "一覧", "IPA", "エール", "ラガー"],
  authors: [{ name: "Beer Link" }],
  creator: "Beer Link",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Beer Link",
    title: "Beer Link - 知って繋がる、ビールの楽しさ",
    description:
      "クラフトビールの情報・レビューが集まるファンサイト。ビール、ブルワリー、ビアスタイルの一覧と口コミ投稿機能を提供します。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beer Link - 知って繋がる、ビールの楽しさ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beer Link - 知って繋がる、ビールの楽しさ",
    description:
      "クラフトビールの情報・レビューが集まるファンサイト。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundBubbles />
        <div className="min-h-screen flex flex-col relative z-10">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/layout/query-provider";
import { GlobalAudioPlayer } from "@/components/audio/global-audio-player";

export const metadata: Metadata = {
  title: "AI Music Studio — Nền tảng sáng tác nhạc trực tuyến thông minh",
  description:
    "Sáng tác âm nhạc chuyên nghiệp từ mô tả văn bản với AI. Quản lý dự án, thư viện bài hát, phiên bản và playlist dễ dàng.",
  keywords: ["AI Music", "Tạo nhạc AI", "Sáng tác nhạc", "Music Studio", "AI Generator"],
  authors: [{ name: "AI Music Studio Team" }],
};

export const viewport: Viewport = {
  themeColor: "#080c14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <QueryProvider>
          {children}
          <GlobalAudioPlayer />
        </QueryProvider>
      </body>
    </html>
  );
}

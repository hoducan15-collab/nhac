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
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.addEventListener('error', function(e) {
                  if ((e.filename && e.filename.indexOf('chrome-extension://') !== -1) || 
                      (e.message && (e.message.indexOf('M_ID') !== -1 || e.message.indexOf('chrome-extension') !== -1))) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e.reason && (e.reason.stack || e.reason.message || String(e.reason))) || '';
                  if (reason.indexOf('chrome-extension://') !== -1 || reason.indexOf('M_ID') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                // Auto-dismiss any Next.js error overlay caused by external Chrome extensions
                setInterval(function() {
                  try {
                    const portal = document.querySelector('nextjs-portal');
                    if (portal) {
                      const root = portal.shadowRoot || portal;
                      const text = root.textContent || '';
                      if (text.indexOf('M_ID') !== -1 || text.indexOf('chrome-extension://') !== -1) {
                        portal.remove();
                      }
                    }
                  } catch (e) {}
                }, 400);

                const observer = new MutationObserver(function(mutations) {
                  for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName) {
                      const name = m.attributeName;
                      if (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0) {
                        m.target.removeAttribute(name);
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, { attributes: true, subtree: true });
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-purple-600 selection:text-white"
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <GlobalAudioPlayer />
        </QueryProvider>
      </body>
    </html>
  );
}

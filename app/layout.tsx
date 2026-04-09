import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

// CLAUDE.md 디자인 가이드: Inter (UI), JetBrains Mono (코드)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevNote",
  description: "개발자의 학습 순간을 캡처하고, AI가 맥락을 붙여주는 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <Sidebar />
        <div
          className="flex-1 flex overflow-hidden"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            background: '#0f172a',
            color: '#e2e8f0',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}

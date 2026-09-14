import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "프로티원 | 행사 운영",
  description: "행사 계획, 상품 구성, 미디어 운영, 손익과 채널별 성과 관리",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

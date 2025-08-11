import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "드라이빙존 미션 페이백 시스템",
  description: "운전면허 합격을 축하합니다! 미션을 완료하고 페이백을 받아보세요.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#1a1a1a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "드라이빙존",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <main
        className={`max-w-screen-sm mx-auto`}
      >
        {children}
        {/* <ConnectionStatus /> */}
      </main>
  );
}

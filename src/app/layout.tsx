import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner'
import { ToastContainer, ConnectionStatus } from "@/components/gamification/RealTimeNotification"
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
  title: "드라이빙존 미션 페이백 시스템",
  description: "운전면허 합격을 축하합니다! 미션을 완료하고 페이백을 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster 
          position="top-center"
          richColors
          closeButton
        />
        <ToastContainer />
        <ConnectionStatus />
      </body>
    </html>
  );
}

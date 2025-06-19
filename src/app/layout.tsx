import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MCP Catalog - MCP 서버 카탈로그",
  description: "사내 MCP(Model Context Protocol) 서버들을 등록하고 관리하는 카탈로그 서비스",
  keywords: ["MCP", "서버", "카탈로그", "Model Context Protocol"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </body>
    </html>
  );
} 
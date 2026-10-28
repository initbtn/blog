import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: "dominic.log | 소프트웨어 엔지니어링 & 시스템 아키텍처 아티클",
    template: "%s | dominic.log",
  },
  description: "실전 시스템 엔지니어링, 보안 게이트웨이, 고빈도 데이터 파이프라인, AI RAG 아키텍처 심층 분석 및 기술 회고 기록",
  keywords: ["Software Engineering", "Next.js", "Architecture", "Zero Trust", "GIS", "RAG", "Vue.js", "AI Agent"],
  authors: [{ name: "Dominic" }],
  creator: "Dominic",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "dominic.log | 소프트웨어 엔지니어링 기술 블로그",
    description: "실전 시스템 엔지니어링, 보안 게이트웨이, GIS, AI RAG 아키텍처 심층 분석",
    siteName: "dominic.log",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

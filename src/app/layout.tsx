import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://domlog.vercel.app'),
  title: {
    default: "domlog | 소프트웨어 엔지니어링 & 시스템 아키텍처 저널",
    template: "%s | domlog",
  },
  description: "클라이언트 제로 트러스트 WAS 게이트웨이, 10Hz 해양 GIS 항법 엔진, sLM RAG 파이프라인 등 실전 문제 해결과 아키텍처 심층 분석 저널",
  keywords: ["Software Engineering", "Next.js", "Architecture", "Zero Trust", "GIS", "RAG", "Vue.js", "AI Agent", "domlog", "waffle", "initbtn"],
  authors: [{ name: "initbtn", url: "https://github.com/initbtn" }],
  creator: "initbtn",
  alternates: {
    canonical: 'https://domlog.vercel.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://domlog.vercel.app',
    siteName: 'domlog',
    title: 'domlog | 소프트웨어 엔지니어링 & 시스템 아키텍처 저널',
    description: '낮은 결합도와 높은 응집도를 갖춘 모듈식 객체지향 설계, WAS 보안 게이트웨이, 해양 GIS 10Hz 분석',
    images: [
      {
        url: 'https://domlog.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'domlog - Waffle Grid (initbtn) Engineering Journal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'domlog | 소프트웨어 엔지니어링 & 시스템 아키텍처 저널',
    description: '낮은 결합도와 높은 응집도를 갖춘 모듈식 객체지향 설계, WAS 보안 게이트웨이, 해양 GIS 10Hz 분석',
    images: ['https://domlog.vercel.app/og-image.png'],
    creator: '@initbtn',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'domlog',
    url: 'https://domlog.vercel.app',
    description: '소프트웨어 엔지니어링 및 시스템 아키텍처 기술 블로그',
    author: {
      '@type': 'Person',
      name: 'initbtn',
      url: 'https://github.com/initbtn',
      sameAs: [
        'https://github.com/initbtn',
        'https://domlog.vercel.app',
      ],
    },
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 bg-grid-pattern relative">
        {/* Top ambient radial light */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-radial-glow pointer-events-none" />
        
        <Header />
        
        {/* Main content with pb-24 on mobile to accommodate bottom tab bar */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-6 py-8 sm:py-10 pb-28 md:pb-12 relative z-10">
          {children}
        </main>
        
        <Footer />
        
        {/* Mobile Bottom Navigation Bar (md:hidden) */}
        <MobileBottomNav />
      </body>
    </html>
  );
}

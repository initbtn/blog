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
    default: "domlog | Full-Stack & AI Systems Builder",
    template: "%s | domlog",
  },
  description: "웹 풀스택 엔지니어링, 실시간 시스템, AI RAG 에이전트를 만드는 initbtn의 기술 블로그",
  keywords: ["Software Engineering", "Full-Stack", "AI Builder", "Next.js", "Architecture", "Zero Trust", "GIS", "RAG", "domlog", "initbtn"],
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
    title: 'domlog | Full-Stack & AI Systems Builder',
    description: '웹 풀스택 엔지니어링, 실시간 시스템, AI RAG 에이전트를 만드는 initbtn의 기술 블로그',
    images: [
      {
        url: 'https://domlog.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'domlog - Full-Stack & AI Systems Builder (@initbtn)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'domlog | Full-Stack & AI Systems Builder',
    description: '웹 풀스택 엔지니어링, 실시간 시스템, AI RAG 에이전트를 만드는 initbtn의 기술 블로그',
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
      jobTitle: 'Full-Stack & AI Systems Builder',
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
        <div className="absolute top-0 left-0 right-0 h-96 bg-radial-glow pointer-events-none" />
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-6 py-8 sm:py-10 pb-28 md:pb-12 relative z-10">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}

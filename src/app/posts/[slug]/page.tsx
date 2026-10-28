import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '아티클을 찾을 수 없습니다',
    };
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `https://domlog.vercel.app/posts/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | domlog`,
      description: post.summary,
      url: `https://domlog.vercel.app/posts/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['https://github.com/initbtn'],
      tags: post.tags,
      images: [
        {
          url: 'https://domlog.vercel.app/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | domlog`,
      description: post.summary,
      images: ['https://domlog.vercel.app/og-image.png'],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://domlog.vercel.app/posts/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: '남성호 (Dominic)',
      url: 'https://initbtn.github.io/resume-vuejs/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'domlog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://domlog.vercel.app/avatar.png',
      },
    },
  };

  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors group"
        >
          <span className="mr-1.5 group-hover:-translate-x-1 transition-transform">←</span>
          <span>목록으로 돌아가기</span>
        </Link>
      </div>

      {/* Header Container */}
      <header className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            ENGINEERING ESSAY
          </span>
          <time dateTime={post.date}>{post.date}</time>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{post.readingTime}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
          {post.summary}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-mono rounded bg-slate-800/80 border border-slate-700/60 text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Markdown Body */}
      <div className="glass-panel rounded-2xl p-6 sm:p-10">
        <div
          className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-sky-400 hover:prose-a:underline prose-code:text-sky-300 prose-pre:border prose-pre:border-slate-800"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />
      </div>

      {/* Post Footer */}
      <footer className="glass-panel rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <Link
          href="/"
          className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 font-mono"
        >
          ← 아티클 목록 전체보기
        </Link>
        <div className="flex items-center gap-3">
          <span>작성자: 남성호 (Dominic)</span>
          <span>•</span>
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-sky-400 transition-colors"
          >
            이력서 ↗
          </a>
        </div>
      </footer>
    </article>
  );
}

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
    openGraph: {
      title: `${post.title} | dominic.log`,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs text-muted hover:text-foreground transition-colors group"
        >
          <span className="mr-1 group-hover:-translate-x-0.5 transition-transform">←</span> 아티클 목록으로
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <time dateTime={post.date}>{post.date}</time>
          <span>•</span>
          <span className="text-sky-500 font-medium">{post.readingTime}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg text-muted leading-relaxed">
          {post.summary}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs rounded bg-card border border-border text-muted font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Markdown Body */}
      <div
        className="prose dark:prose-invert max-w-none text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-a:text-sky-500 hover:prose-a:underline prose-code:text-sky-400 prose-pre:border prose-pre:border-border prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.htmlContent }}
      />

      {/* Post Footer */}
      <footer className="border-t border-border pt-8 mt-16 space-y-6">
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-sky-500 hover:text-sky-400 font-medium inline-flex items-center gap-1"
          >
            ← 전체 목록으로 돌아가기
          </Link>
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground text-xs"
          >
            작성자 이력서 확인 ↗
          </a>
        </div>
      </footer>
    </article>
  );
}

import Link from 'next/link';
import type { PostMeta } from '../types/post';

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  if (featured) {
    return (
      <article className="group relative glass-panel rounded-2xl p-6 sm:p-8 hover:border-sky-500/50 transition-all duration-300 shadow-xl shadow-black/40 overflow-hidden">
        {/* Ambient card accent light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/15 transition-colors" />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              FEATURED ESSAY
            </span>
            <time dateTime={post.date} className="font-mono">{post.date}</time>
          </div>
          <span className="text-amber-400/90 font-mono text-xs flex items-center gap-1">
            <span>⏱</span> {post.readingTime}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 group-hover:text-sky-400 transition-colors mb-3 leading-snug relative z-10">
          <Link href={`/posts/${post.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h2>

        <p className="text-sm text-slate-300/80 leading-relaxed mb-6 line-clamp-3 relative z-10">
          {post.summary}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 relative z-10 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono text-[11px]"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform">
            아티클 전문 읽기 →
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative glass-panel rounded-xl p-5 sm:p-6 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2 font-mono">
        <time dateTime={post.date}>{post.date}</time>
        <span>•</span>
        <span className="text-amber-400/80">{post.readingTime}</span>
      </div>

      <h2 className="text-lg font-bold tracking-tight text-slate-100 group-hover:text-sky-400 transition-colors mb-2">
        <Link href={`/posts/${post.slug}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          {post.title}
        </Link>
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {post.summary}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 relative z-10">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800/60 text-slate-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

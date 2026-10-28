import Link from 'next/link';
import type { PostMeta } from '../types/post';

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative border-b border-border py-8 first:pt-4 last:border-b-0">
      <div className="flex items-center gap-3 text-xs text-muted mb-2">
        <time dateTime={post.date}>{post.date}</time>
        <span>•</span>
        <span className="text-sky-500 font-medium">{post.readingTime}</span>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-sky-500 transition-colors mb-2">
        <Link href={`/posts/${post.slug}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          {post.title}
        </Link>
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
        {post.summary}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 relative z-10">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-card text-muted rounded border border-border"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

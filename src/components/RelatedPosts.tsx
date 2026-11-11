import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { PostMeta } from '../types/post';
import { TopicFrequencyBadge } from './TopicFrequencyBadge';

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: string[];
  allPosts: PostMeta[];
}

export function RelatedPosts({ currentSlug, currentTags, allPosts }: RelatedPostsProps) {
  // Score posts based on tag overlap and same category
  const scoredPosts = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      // Tag matches
      const commonTags = p.tags.filter((t) => currentTags.includes(t));
      score += commonTags.length * 3;

      // Module match e.g. both are ncs-swe-1-*
      const currentModuleMatch = currentSlug.match(/ncs-swe-(?:module-)?(\d+)/);
      const targetModuleMatch = p.slug.match(/ncs-swe-(?:module-)?(\d+)/);
      if (currentModuleMatch && targetModuleMatch && currentModuleMatch[1] === targetModuleMatch[1]) {
        score += 5;
      }

      // Same category match (ncs vs non-ncs)
      const currentIsNcs = currentSlug.startsWith('ncs-swe');
      const targetIsNcs = p.slug.startsWith('ncs-swe');
      if (currentIsNcs === targetIsNcs) {
        score += 1;
      }

      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const related = scoredPosts.slice(0, 2).map((s) => s.post);

  if (related.length === 0) return null;

  return (
    <section className="space-y-4 pt-4 border-t border-slate-800/80">
      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>함께 학습하면 좋은 연관 주제</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((post) => (
          <article
            key={post.slug}
            className="group glass-panel rounded-xl p-4 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/30 transition-all flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-500">{post.date}</span>
                <TopicFrequencyBadge slug={post.slug} />
              </div>

              <h4 className="text-sm font-bold text-slate-200 group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                <Link href={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs">
              <span className="font-mono text-[11px] text-amber-400/80">{post.readingTime}</span>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 group-hover:translate-x-0.5 transition-transform"
              >
                <span>학습하기</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

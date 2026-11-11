'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpDown, BookOpen, Layers, Terminal } from 'lucide-react';
import type { PostMeta } from '../types/post';
import { TopicFrequencyBadge } from './TopicFrequencyBadge';

interface ArticleExplorerProps {
  posts: PostMeta[];
}

type CategoryType = 'all' | 'ncs' | 'engineering';
type SortType = 'series' | 'latest' | 'oldest';

export function ArticleExplorer({ posts }: ArticleExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('series');

  // 1. Filter posts by category
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeCategory === 'ncs') {
        return p.slug.startsWith('ncs-swe');
      }
      if (activeCategory === 'engineering') {
        return !p.slug.startsWith('ncs-swe');
      }
      return true;
    });
  }, [posts, activeCategory]);

  // 2. Sort posts
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (activeSort === 'latest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (activeSort === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // 'series' sort: prioritize title natural order e.g. [1-1] -> [1-2] -> [2-1]
      return a.title.localeCompare(b.title, 'ko-KR', { numeric: true, sensitivity: 'base' });
    });
  }, [filteredPosts, activeSort]);

  // Category counts
  const counts = useMemo(() => {
    const ncs = posts.filter((p) => p.slug.startsWith('ncs-swe')).length;
    return {
      all: posts.length,
      ncs,
      engineering: posts.length - ncs,
    };
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Sorting Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl glass-panel border border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>전체</span>
            <span className="font-mono text-[10px] text-slate-500">({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('ncs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeCategory === 'ncs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>NCS 소프트웨어공학</span>
            <span className="font-mono text-[10px] text-slate-500">({counts.ncs})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('engineering')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeCategory === 'engineering'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>엔지니어링 & 아키텍처</span>
            <span className="font-mono text-[10px] text-slate-500">({counts.engineering})</span>
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 px-2 self-end sm:self-auto text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortType)}
            className="bg-slate-900/90 text-slate-300 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
          >
            <option value="series">시리즈 / 제목순</option>
            <option value="latest">최신순</option>
            <option value="oldest">과거순</option>
          </select>
        </div>
      </div>

      {/* Compact List View */}
      <div className="divide-y divide-slate-800/60 rounded-2xl glass-panel overflow-hidden border border-slate-800/80">
        {sortedPosts.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            해당 카테고리의 아티클이 없습니다.
          </div>
        ) : (
          sortedPosts.map((post) => (
            <article
              key={post.slug}
              className="group p-5 sm:p-6 hover:bg-slate-800/40 transition-colors flex flex-col gap-2.5"
            >
              {/* Meta Top Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 font-mono text-slate-400">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>•</span>
                  <span className="text-amber-400/80">{post.readingTime}</span>
                </div>

                {/* Topic Frequency Badge */}
                <TopicFrequencyBadge slug={post.slug} />
              </div>

              {/* Title Link */}
              <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors leading-snug">
                <Link href={`/posts/${post.slug}`} className="focus:outline-none">
                  {post.title}
                </Link>
              </h3>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                {post.summary}
              </p>

              {/* Bottom Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800/80 text-slate-400 border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

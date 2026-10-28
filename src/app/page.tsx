import { getAllPosts, getAllTags } from '../lib/posts';
import { PostCard } from '../components/PostCard';
import Link from 'next/link';

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="space-y-12">
      {/* Hero / Intro */}
      <section className="space-y-4 border-b border-border pb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          실전 시스템 엔지니어링 & <br className="hidden sm:inline" />
          <span className="text-sky-500">아키텍처 회고</span>
        </h1>
        <p className="text-base text-muted max-w-2xl leading-relaxed">
          클라이언트 제로 트러스트 보안 게이트웨이, 10Hz 해양 GIS 추측항법, Vue 3 마이그레이션,
          그리고 온디바이스 sLM 기반 RAG 아키텍처까지 실무에서 부딪히고 해결한 트러블슈팅과 설계 결정을 기록합니다.
        </p>
        <div className="flex items-center gap-4 pt-2 text-sm">
          <Link
            href="/about"
            className="inline-flex items-center text-sky-500 hover:text-sky-400 font-medium transition-colors"
          >
            엔지니어링 철학 및 소개 →
          </Link>
        </div>
      </section>

      {/* Tags section */}
      {tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted">
            주요 주제
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs rounded-full bg-card border border-border text-foreground hover:border-sky-500 transition-colors"
              >
                #{tag} <span className="text-muted ml-0.5">({count})</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Article List */}
      <section className="space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-muted">
            전체 아티클 ({posts.length})
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="py-16 text-center text-muted">
            아직 발행된 아티클이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { getAllPosts, getAllTags } from '../lib/posts';
import { PostCard } from '../components/PostCard';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section: Persona Bento Card */}
      <section className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-semibold">ONLINE</span>
              <span className="text-slate-500">|</span>
              <span className="font-mono text-sky-400 font-medium">@initbtn</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Full-Stack & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300">
                AI Systems Builder
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed">
              견고한 웹 풀스택 시스템부터 10Hz 실시간 데이터 파이프라인, AI RAG 에이전트까지.
              문제를 시스템으로 해결하는 과정과 트러블슈팅을 기록합니다.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/about"
                className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs sm:text-sm font-bold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
              >
                소개 보기 →
              </Link>
              <a
                href="https://initbtn.github.io/resume-vuejs/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-medium hover:border-slate-500 transition-colors"
              >
                이력서 확인 ↗
              </a>
            </div>
          </div>

          {/* Waffle Keycap Mascot Card */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500 to-amber-400 opacity-30 blur-md group-hover:opacity-60 transition duration-500" />
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-slate-900 border-2 border-slate-700/80 p-3 flex flex-col items-center justify-between shadow-2xl">
                <Image
                  src="/avatar.png"
                  alt="Waffle Keycap Mascot"
                  width={140}
                  height={140}
                  className="rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  priority
                />
                <div className="w-full text-center py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-sky-400 font-bold">
                  INITBTN (⟲)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Featured Essay */}
      {featuredPost && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />
              최신 기술 심층 아티클
            </h2>
          </div>
          <PostCard post={featuredPost} featured={true} />
        </section>
      )}

      {/* Topic Tag Matrix */}
      {tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
            주제별 탐색 Matrix
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-mono rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-sky-500/60 hover:text-sky-300 transition-colors cursor-pointer"
              >
                #{tag} <span className="text-slate-500 ml-1">[{count}]</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Regular Articles Section (if more exist) */}
      {regularPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            전체 아카이브
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {regularPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Engineering Ecosystem Card */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800/80">
        <h3 className="text-sm font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Ecosystem & Cross-Links
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-colors block group"
          >
            <div className="font-bold text-slate-200 group-hover:text-sky-400 mb-1 flex items-center justify-between">
              <span>Interactive Resume</span>
              <span>↗</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Vue 3 + Vite 기반의 포트폴리오. WAS 보안 게이트웨이 및 원격 Supabase 연동.
            </p>
          </a>

          <a
            href="https://github.com/initbtn/marine-sensor-gis"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-colors block group"
          >
            <div className="font-bold text-slate-200 group-hover:text-sky-400 mb-1 flex items-center justify-between">
              <span>Marine GIS Dashboard</span>
              <span>↗</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              10Hz 해양 센서 텔레메트리, 실시간 추측항법(Dead Reckoning) 엔진.
            </p>
          </a>

          <a
            href="https://github.com/initbtn/assist"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-colors block group"
          >
            <div className="font-bold text-slate-200 group-hover:text-sky-400 mb-1 flex items-center justify-between">
              <span>Assist AI Agent</span>
              <span>↗</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              온디바이스 sLM 기반 지식 RAG 파이프라인 및 엔지니어링 에이전트.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}

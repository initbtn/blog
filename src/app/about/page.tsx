import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '소개 & 엔지니어링 철학',
  description: '도미닉(Dominic)의 엔지니어링 가치관, 아키텍처 철학, 그리고 코드네임 waffle의 유래',
  alternates: {
    canonical: 'https://domlog.vercel.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      {/* Header Container */}
      <header className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-900 border border-slate-700/80 p-2 shrink-0 shadow-xl">
            <Image
              src="/avatar.png"
              alt="Waffle Key Mascot"
              width={112}
              height={112}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 font-mono">
              <span>Alias: <strong>Dominic</strong></span>
              <span>•</span>
              <span className="text-amber-400">code: waffle</span>
              <span>•</span>
              <span className="text-sky-400">initbtn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              소개 & 엔지니어링 철학
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              복잡성을 숨기기보다 불필요한 계층을 걷어내며,
              장애 발생 시 브라우저 번들부터 데이터베이스 커널까지 추적하여 문제를 해결합니다.
            </p>
          </div>
        </div>
      </header>

      {/* Main Philosophy Sections */}
      <section className="glass-panel rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">#</span> 코드네임 waffle 과 initbtn 의 유래
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            <strong>Waffle(와플)</strong>은 정돈된 격자(Grid) 구조처럼 안정적이고 규격화된 시스템 아키텍처를 상징하며, 
            <strong>initbtn(초기화 버튼)</strong>은 문제가 꼬였을 때 미봉책으로 덮지 않고 시스템의 기저 상태(Clean State)로 명확히 환원할 수 있는 설계 능력을 의미합니다.
            시스템을 언제든 신뢰 가능한 최초 상태로 초기화할 수 있는 안전장치를 만드는 것이 저의 핵심 엔지니어링 태도입니다.
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> 핵심 엔지니어링 3원칙
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400">1. Zero Trust 격리</div>
              <p className="text-slate-400 leading-relaxed text-xs">
                클라이언트는 안전하지 않습니다. DB 인증 정보와 도메인은 브라우저에 단 1바이트도 남기지 않고 WAS 게이트웨이 뒤로 격리합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400">2. Simplicity & Surgical</div>
              <p className="text-slate-400 leading-relaxed text-xs">
                지레짐작 추상화나 불필요한 레이어를 지양합니다. 문제를 해결하는 가장 작고 외과적인(surgical) 최소 코드를 작성합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400">3. Goal-Driven TDD</div>
              <p className="text-slate-400 leading-relaxed text-xs">
                실패하는 테스트를 먼저 세우고, 정량적 메트릭과 실측 지표를 통해서만 변경의 유효성을 단언합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back button */}
      <div className="pt-2">
        <Link
          href="/"
          className="text-sky-400 hover:text-sky-300 font-mono text-xs inline-flex items-center gap-1.5"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

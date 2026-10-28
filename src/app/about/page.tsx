import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Layers, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: '소개',
  description: '웹 프론트엔드 & 풀스택 개발자 initbtn의 블로그 소개 및 Waffle Grid 아키텍처 이야기',
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
              alt="Waffle Grid Mascot"
              width={112}
              height={112}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 font-mono">
              <span className="text-sky-400 font-semibold">@initbtn</span>
              <span>•</span>
              <span className="text-slate-400">Web & System Developer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              소개
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              웹 프론트엔드와 풀스택을 다루며, 복잡한 시스템의 구조를 명확하게 정리하고
              실무에서 마주친 트러블슈팅 경험을 공유하는 것을 좋아합니다.
            </p>
          </div>
        </div>
      </header>

      {/* Main Story & Profile */}
      <section className="glass-panel rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Waffle Grid 와 initbtn 이야기</span>
          </h2>
          <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-3">
            <p>
              블로그의 마스코트는 <strong>3×3 모듈형 와플 그리드(Waffle Grid)</strong>와 키보드의 <strong>초기화 버튼(initbtn)</strong>을 모티브로 삼았습니다.
            </p>
            <p>
              와플의 균일하고 단단한 격자는 소프트웨어 공학의 핵심인 <strong>'낮은 결합도(Low Coupling)'</strong>와 <strong>'높은 응집도(High Cohesion)'</strong>를 상징합니다. 각 모듈이 독립적인 책임을 가지면서도 전체 시스템 안에서 유기적으로 맞물려 조화를 이루는 객체지향적 설계를 지향합니다.
            </p>
            <p>
              그리고 중앙의 <strong>초기화 버튼(initbtn)</strong>은 복잡하게 꼬인 상태나 장애가 발생했을 때 미봉책으로 덮지 않고, 언제든 신뢰할 수 있는 최초의 깨끗한 기본 상태(Clean State)로 환원할 수 있는 회복 탄력성과 제로 트러스트(Zero Trust) 격리 철학을 나타냅니다.
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-400" />
            <span>관심사와 개발 태도</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>보안과 격리</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                클라이언트에 민감한 정보를 노출하지 않고, 백엔드 게이트웨이를 얇고 안전하게 배치하는 구조를 지향합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>모듈식 객체 설계</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                지나친 과설계나 복잡한 의존성 대신, 단단한 응집도와 낮은 결합도를 유지하여 유지보수하기 쉬운 코드를 만듭니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>실측과 테스트</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                가정만으로 코드를 넘기지 않고, 명확한 테스트 케이스와 지표 측정을 통해 안정성을 검증합니다.
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

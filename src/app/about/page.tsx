import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '소개 & 엔지니어링 철학',
  description: '도미닉(Dominic)의 엔지니어링 가치관, 아키텍처 철학, 그리고 문제 해결 여정',
};

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4 border-b border-border pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          About & <span className="text-sky-500">Engineering Philosophy</span>
        </h1>
        <p className="text-base text-muted max-w-2xl leading-relaxed">
          화려한 추상화보다 단순하고 견고한 아키텍처를 추구하며,
          문제가 발생한 프로덕션의 가장 깊은 곳까지 파고들어 본질적인 해결책을 도출합니다.
        </p>
      </header>

      <section className="prose dark:prose-invert max-w-none text-foreground space-y-6">
        <h2>왜 기술 블로그인가?</h2>
        <p>
          이력서(Resume)는 30초 내에 핵심 역량과 정량적 성과를 요약 전달하는 공간이고,
          GitHub README는 소프트웨어의 설치와 사용법을 안내하는 매뉴얼입니다.
        </p>
        <p>
          하지만 엔지니어로서 가장 값진 자산은 <strong>"왜 이 설계를 선택했고 어떤 트레이드오프와 실패를 겪으며 해결했는가"</strong>라는 사유의 과정입니다.
          이 블로그는 단순 튜토리얼의 나열이 아니라 실무에서 마주한 기술적 난제와 의사결정의 이면을 솔직하게 기록하는 엔지니어링 저널입니다.
        </p>

        <h2>핵심 엔지니어링 원칙</h2>
        <ul className="space-y-2">
          <li>
            <strong>Zero Trust & Data Isolation:</strong> 클라이언트는 언제나 잠재적으로 오염될 수 있는 환경으로 간주합니다. 인증 정보나 DB 직접 질의 권한은 브라우저에 단 1바이트도 두지 않고 격리된 WAS 게이트웨이를 경유합니다.
          </li>
          <li>
            <strong>Simplicity First (Karpathy Principles):</strong> 요청받지 않은 지레짐작 추상화나 불필요한 레이어를 지양합니다. 문제를 해결하는 가장 작고 외과적인(surgical) 최소 코드를 작성합니다.
          </li>
          <li>
            <strong>Goal-Driven Feedback Loop:</strong> 눈대중이 아닌 실측 지표, 단위 테스트(TDD), E2E 검증 파이프라인을 통해서만 배포 안정성을 확신합니다.
          </li>
        </ul>

        <h2>주요 활동 및 링크</h2>
        <div className="not-prose grid sm:grid-cols-2 gap-4 pt-4">
          <a
            href="https://initbtn.github.io/resume-vuejs/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-lg border border-border bg-card hover:border-sky-500 transition-colors block"
          >
            <div className="text-sm font-bold text-foreground mb-1 flex items-center justify-between">
              <span>Interactive Resume</span>
              <span className="text-xs text-sky-500">이동 ↗</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Vue 3 + Vite 기반의 포트폴리오. WAS 보안 게이트웨이 및 원격 Supabase 연동.
            </p>
          </a>

          <a
            href="https://github.com/initbtn"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-lg border border-border bg-card hover:border-sky-500 transition-colors block"
          >
            <div className="text-sm font-bold text-foreground mb-1 flex items-center justify-between">
              <span>GitHub Profile</span>
              <span className="text-xs text-sky-500">이동 ↗</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              오픈소스 활동, GIS 엔진, AI 어시스턴트, 풀스택 리포지토리 모음.
            </p>
          </a>
        </div>
      </section>

      <div className="pt-6">
        <Link
          href="/"
          className="text-sky-500 hover:text-sky-400 font-medium inline-flex items-center gap-1 text-sm"
        >
          ← 아티클 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

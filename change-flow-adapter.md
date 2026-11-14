# Change-flow 어댑터 — blog (C tier)

`change-flow` 스킬(보편 A/B 흐름)이 `blog` 저장소(`/home/dominic/projects/blog`)를 대상으로 돌 때 참조하는 프로젝트별 파라미터 어댑터 정의입니다. 흐름과 규율은 `domstack`의 `skills/change-flow/SKILL.md`가 소유하며, 여기에는 `blog` 특화 mechanic 및 계약만 선언합니다.

## 파라미터

| 키 | `blog` 설정값 | 설명 |
| :--- | :--- | :--- |
| **앱 메타** | 산출물 유형: `web-app` | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 정적/SSR 블로그 |
| **issue(◦)** | **버그·기능 추가·어댑터 변경 = 필수**, 아티클 초안/수정 = 선택 | GitHub 이슈 선등록 (`publish-issue`), PR 생성 시 `closes #N` 연결 |
| **착수 표시(◦)** | **켠다**(기본값) | `gh issue edit <N> --add-assignee @me`. 착수 후 완료조건/계획 문구 불변 |
| **라벨(◦)** | `article`, `enhancement`, `bug`, `refactor`, `documentation`, `workflow` | 이슈 성격별 표준 라벨 자동 부여 (`gh issue edit <N> --add-label <라벨>`) |
| **마일스톤(◦)** | **없음**(기본값) | 필요 시 버전별 마일스톤 생성 |
| **프로젝트(◦)** | **연동**(Notion Master Board: `4152e342-7364-81c4-9af1-d8221d4f28f6`) | 착수: `4. Draft (초안작성)` / PR 대기: `5. Ready (발행대기)` / 종결: `6. Published (발행완료)` |
| **worktree(①)** | 브랜치 분기 (`feat/*`, `fix/*`, `content/*`, `test/*`) | 표준 Git 피처 브랜치 격리 |
| **토큰(⓪⑤⑥⑧)** | `GH_TOKEN="$(pass show github.com/initbtn)"` | GitHub API 및 푸시 인증 토큰 동적 주입 |
| **verify(③)** | **Tier 1 (Client TDD Unit)**: `npm test` (Vitest)<br>**정적 타입/빌드**: `npm run build` (Turbopack)<br>**Tier 2 (Post-Deploy E2E)**: `npx playwright test` | **Iron Law (앱 production 로직 한정)**: 실패하는 단위 테스트(RED) 선행 필수. 네트워크/DB는 100% Mock.<br>docs·규율·adapter 변경 시에는 링크·앵커 무결성 및 구조 검증으로 대체. |
| **테스트 케이스(TC)** | **없음**(기본값) | 별도 외부 TC 스프레드시트 없음 |
| **ADR(②)** | 자리 = `docs/architecture-decision-record/` | 형식 정본 = `publish-adr` 스킬 |
| **리뷰 차원(⑦)** | **보안·시크릿 격리** (`careful-gate`, 제로트러스트)<br>**디자인 토큰 일관성** (라이트/다크 1:1 대칭, `globals.css`)<br>**접근성 및 반응형** (Table-to-Card, 모바일 UX)<br>**plan-match** (이슈 완료조건 대조) | **`/review-army` 위임 필수 관문**: PR 생성 직후 서브에이전트 1인을 소환하여 종합 리뷰를 회수하고 PR에 요약 코멘트를 남기기 전에는 머지 게이트(⑧) 진입 절대 금지 |
| **커밋(④)** | `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `content:` | 한국어, forward-only |
| **PR(⑥)** | PR 본문에 검증 증거(테스트/빌드 결과) 첨부 | `closes #N` 연결. 머지는 하지 않음(⑧ 사람 게이트) |
| **merge 모델(⑧)** | **squash-only** | 단독 owner, 사람 머지 게이트 준수 (명시 승인 시에만 `gh pr merge --squash --delete-branch`) |
| **cleanup(⑨)** | 로컬 및 원격 피처 브랜치 정리 | 머지 후 `main` 브랜치 동기화 및 브랜치 삭제 |
| **배포(⑩)** | Vercel 프로덕션 배포 (`vercel deploy --prod` / 자동 CI) | Production URL: `https://domlog.vercel.app`<br>Scope: `jsconn`, Project: `blog` |
| **warming** | pass / gpg-agent | `DOMSTACK_WARMING` 활성화 시 pass 캐시 상태 점검 후 실행 |
| **보안 규율** | 제로 트러스트 & 시크릿 격리 | 1. 클라이언트 번들에 관리자 화이트리스트, 데이터베이스 자격증명 노출 금지 (서버 보안 API 단독 위임)<br>2. 비공개 기출문제 등 민감 데이터는 `data/private/` 격리 |
| **스타일 규율** | Tailwind CSS v4 & Typography & 디자인 토큰 | `docs/design-system/domlog-design-system.md` 정본 준수. 인라인 스타일 금지, `--card-bg` 등 CSS 변수 기반 듀얼 테마 클래스 필수 |
| **아티클 규율** | 엔지니어링 STAR 구조 및 분량 | 1. 5분 내외 분량 (~1,500 - 2,500 단어)<br>2. 구조: 호기심 $\rightarrow$ 문제 증상 $\rightarrow$ 근본 원인 $\rightarrow$ 해결 $\rightarrow$ 실측 인사이트 |

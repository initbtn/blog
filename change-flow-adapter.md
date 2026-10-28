# Change-flow 어댑터 — blog (C tier)

`change-flow` 스킬이 `blog` 저장소(`/home/dominic/projects/blog`)를 대상으로 돌 때 참조하는 프로젝트별 파라미터 어댑터 정의입니다.

## 파라미터

| 키 | `blog` 설정값 | 설명 |
| :--- | :--- | :--- |
| **issue(◦)** | **버그·기능 추가 = 필수**, 아티클 초안/수정 선택 | GitHub 이슈 선등록 (`publish-issue`), PR 시 `closes #N` 연결 |
| **착수 표시(◦)** | **켠다** | `gh issue edit <N> --add-assignee @me` |
| **라벨(◦)** | `article`, `enhancement`, `bug`, `refactor`, `documentation` | 이슈 성격별 표준 라벨 자동 부여 (`gh issue edit <N> --add-label <라벨>`) |
| **마일스톤** | **없음**(기본값) | 필요 시 버전별 마일스톤 생성 |
| **프로젝트(◦)** | **없음**(기본값) | 추후 GitHub Projects v2 보드 필요 시 연동 |
| **worktree(①)** | 브랜치 분기 (`feat/*`, `fix/*`, `content/*`) | 표준 Git 피처 브랜치 격리 |
| **토큰(⓪⑤⑥⑧)** | `GH_TOKEN="$(pass show github.com/initbtn)"` | GitHub API 및 푸시 인증 토큰 동적 주입 |
| **verify(③)** | `npm test`<br>`npm run type-check`<br>`npm run build` | 1. Vitest 단위 테스트 통과 (Tier 1)<br>2. TypeScript 정적 타입 검사<br>3. Next.js 프로덕션 정적 빌드 성공 |
| **커밋(④)** | `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `content:` | 한국어, forward-only |
| **PR(⑥)** | PR 본문에 검증 증거(테스트/빌드 결과) 첨부 | `closes #N` 연결 |
| **merge 모델(⑧)** | **squash-only** | 단독 owner, 사람 머지 게이트 준수 (명시 승인 시에만) |
| **cleanup(⑨)** | 로컬 및 원격 피처 브랜치 정리 | 머지 후 `main` 브랜치 동기화 |
| **배포(⑩)** | Vercel 또는 GitHub Pages 배포 | `main` 머지 시 자동 빌드 배포 |
| **warming** | pass / gpg-agent | 자격 증명 캐시 상태 점검 후 실행 |
| **보안 규율** | 제로 트러스트 & 시크릿 격리 | 1. 클라이언트 번들에 데이터베이스 자격증명, 평문 API Key 노출 절대 금지<br>2. 원격 API 통신 필요 시 Serverless WAS 게이트웨이 경유 |
| **스타일 규율** | Tailwind CSS v4 & Typography | 인라인 `style={{ ... }}` 금지. `@plugin "@tailwindcss/typography"` 활용한 `.prose` 마크다운 렌더링 |
| **아티클 규율** | 엔지니어링 STAR 구조 및 분량 | 1. 5분 내외 분량 (~1,500 - 2,500 단어)<br>2. 구조: 계기(Curiosity) $\rightarrow$ 문제 증상 $\rightarrow$ 근본 원인 분석 $\rightarrow$ 외과적 해결 $\rightarrow$ 실측 결과/인사이트 |

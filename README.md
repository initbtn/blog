# dominic.log — 엔지니어링 기술 블로그

실전 시스템 엔지니어링, 클라이언트 제로 트러스트 보안 게이트웨이, 10Hz 해양 GIS 항법 엔진, 온디바이스 AI RAG 아키텍처 등 깊이 있는 기술적 고민과 트러블슈팅 경험을 기록하는 엔지니어링 블로그입니다.

## 벤치마크 및 철학
- **스타일 및 톤앤매너:** [wlrnjs.xyz](https://www.wlrnjs.xyz/) 벤치마크 (담백한 문체, 5분 내외 분량, STAR 구조 트러블슈팅).
- **상호 연동:** [이력서(resume-vuejs)](https://initbtn.github.io/resume-vuejs/) 및 [AI 어시스턴트(assist)](https://github.com/initbtn/assist) RAG 파이프라인과 긴밀하게 연계.

## 기술 스택
- **Framework:** Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 (`@tailwindcss/typography`)
- **Engine:** `gray-matter` (Frontmatter) + `marked` (Markdown to HTML)
- **Testing:** Vitest (Tier 1 단위 테스트)

## 프로젝트 구조
```
blog/
├── content/
│   └── posts/                  # 마크다운 아티클 저장소 (.md)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 & 메타데이터
│   │   ├── page.tsx            # 아티클 목록 및 태그 인덱스
│   │   ├── about/              # 엔지니어링 철학 및 소개
│   │   └── posts/[slug]/       # 정적 생성 아티클 리더
│   ├── components/             # Header, Footer, PostCard UI 컴포넌트
│   ├── lib/posts.ts            # 포스트 파서 및 태그/읽기시간 계산기
│   └── types/post.ts           # 아티클 메타데이터 타입 정의
├── tests/                      # Vitest 단위 테스트 스위트
└── change-flow-adapter.md      # domstack change-flow 표준 어댑터
```

## 개발 및 빌드
```bash
# 의존성 설치
npm install

# 단위 테스트 실행 (Vitest)
npm test

# 정적 타입 검사
npm run type-check

# 프로덕션 빌드 (정적 사전 렌더링)
npm run build

# 로컬 개발 서버 실행
npm run dev
```

## 아티클 작성 가이드
`content/posts/<slug>.md` 파일 생성 후 프론트매터 작성:
```yaml
---
title: "아티클 제목"
slug: "article-slug"
date: "YYYY-MM-DD"
summary: "1~2문장의 핵심 요약"
tags: ["Architecture", "Security"]
draft: false
---
```

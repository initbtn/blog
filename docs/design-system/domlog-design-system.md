# domlog Design System Specification & Brief

> **Version**: 1.1.0  
> **Target**: `initbtn/blog` (Next.js 16 + Tailwind CSS v4 + React 19 + `next-themes`)  
> **Status**: Approved Blueprint & Production Specification  
> **Last Updated**: 2026-11-14

---

## 1. 개요 및 원칙

본 문서는 `domlog` 블로그의 반응형 레이아웃, 아이콘셋 표준, 전역 디자인 토큰(다크/라이트 듀얼 테마), 모바일 전용 컴포넌트(헤더, 바텀 네비게이션/캐러셀), 그리고 **표 $\rightarrow$ 카드 반응형 변환(Table-to-Card)**을 일관되게 규정하는 정본 가이드라인입니다.

### 핵심 설계 원칙
1. **Dual-Theme Engineering Scalability (라이트/다크 듀얼 토큰 일원화)**:
   - 다크 모드는 딥 사이버틱 엔지니어링 감성(Deep Navy, Neon Sky Accent)을 보존하고,
   - 라이트 모드는 모눈종이 제도판 감성의 미니멀 클린 테크 룩(Slate 50, Clean Glass, Technical Grid)을 대칭 정의합니다.
   - 모든 컴포넌트는 하드코딩된 다크 클래스를 지양하고 CSS 토큰 변수(`--card-bg`, `--card-border` 등) 및 듀얼 클래스(`text-slate-900 dark:text-slate-100`)를 따릅니다.
2. **No Overflow-Scroll (모바일 가로 스크롤 완전 배제)**:
   - 가로로 넘쳐서 스크롤바가 생기는 데스크톱 지향 표를 모바일(`viewport < 768px`)에서는 세로 스택형 **독립 카드(Card Item)**로 자동 변환합니다.
3. **Ergonomic Mobile UX (엄지손가락 반응형 UX)**:
   - 상단 헤더는 슬림화하고, 모바일 하단에 주요 탐색 및 인터랙티브 위젯(바텀 네비게이션)을 배치하여 한 손 조작성을 극대화합니다.
4. **Unified Icon System (단일 아이콘 규격 & 테마 상속)**:
   - `lucide-react`를 표준 아이콘 엔진으로 지정하고, 브랜딩/커스텀 아이콘(`GithubIcon` 등)은 동일한 뷰박스(24x24)와 스트로크(`strokeWidth={2}`), `stroke="currentColor"`를 준수하여 부모 테마 색상을 자연스럽게 상속받습니다.

---

## 2. 디자인 토큰 매트릭스 (Design Tokens)

`src/app/globals.css`에 선언된 Tailwind CSS v4 기반 테마 변수 매트릭스:

| 토큰명 | CSS 변수명 | Light Theme | Dark Theme (Default) | 용도 및 의미 |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#f8fafc` (Slate 50) | `#090d16` (Deep Navy) | 전체 캔버스 배경 |
| **Foreground** | `--foreground` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | 기본 본문 텍스트, 제목 |
| **Card Surface** | `--card-bg` | `rgba(255, 255, 255, 0.88)` | `rgba(13, 20, 36, 0.92)` | 글래스 패널, 포스트 카드 배경 |
| **Card Border** | `--card-border` | `rgba(15, 23, 42, 0.08)` | `rgba(255, 255, 255, 0.08)` | 반투명 글래스 패널 테두리 |
| **Divider Border** | `--border` | `#e2e8f0` (Slate 200) | `#1e293b` (Slate 800) | 컴포넌트 경계선, 밑줄 |
| **Canvas Grid** | `--grid-line` | `rgba(15, 23, 42, 0.04)` | `rgba(255, 255, 255, 0.02)` | 40px 청사진 엔지니어링 격자선 |
| **Radial Glow** | `--radial-glow` | `rgba(2, 132, 199, 0.06)` | `rgba(56, 189, 248, 0.08)` | 상단 엠비언트 조명 |
| **Muted Text** | `--muted` | `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | 보조 설명, 메타데이터, 타임스탬프 |
| **Primary Accent**| `--accent` | `#0284c7` (Sky 600) | `#38bdf8` (Sky 400) | 하이라이트, 액티브 탭, 키캡 링크 |
| **Warm Accent** | `--waffle` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | 와플 쿠키 포인트, 상태 배지, 리딩타임 |
| **Code Block BG** | `--code-bg` | `#f1f5f9` (Slate 100) | `#0b1120` (Dark Navy) | 마크다운 코드블록(`<pre>`) 배경 |
| **Card Shadow** | `--card-shadow` | `0 4px 20px -2px rgba(0,0,0,0.06)` | `0 4px 20px -2px rgba(0,0,0,0.4)` | 패널 입체감 그림자 |

---

## 3. 아이콘셋 표준 규격 (Iconography Specification)

### 3.1 아이콘 라이브러리 및 크기 표준
- **표준 라이브러리**: `lucide-react`
- **크기 단계 (T-Shirt Size)**:
  - `sm` (14~16px / `w-3.5 h-3.5` ~ `w-4 h-4`): 버튼 내부 보조 아이콘, 인라인 메타데이터, 태그 아이콘
  - `md` (20px / `w-5 h-5`): 모바일 하단 네비게이션(`MobileBottomNav`), 탭 메뉴
  - `lg` (24px / `w-6 h-6`): 헤더 메인 액션, 모달 닫기
- **선 두께(Stroke Width)**:
  - 일반 비활성 상태: `stroke-2` (`strokeWidth={2}`)
  - 활성(Active) 선택 상태: `stroke-[2.5]` (`strokeWidth={2.5}`)

### 3.2 커스텀 SVG 규격 준수 (`src/components/icons/`)
- 외부 브랜드 아이콘(예: `GithubIcon`)은 반드시 다음 속성을 갖추어야 합니다:
  - `viewBox="0 0 24 24"`
  - `fill="none"`
  - `stroke="currentColor"`
  - `strokeWidth={2}` (또는 전달받은 props 상속)
- 이를 통해 `className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"` 등 부모 요소의 Tailwind 텍스트 색상과 크기를 직접 상속받습니다.

---

## 4. 모바일 반응형 헤더 & 바텀 네비게이션

### 4.1 모바일/데스크톱 헤더 (`src/components/Header.tsx`)
- **글래스모피즘**: `.glass-panel` 및 둥근 캡슐형(`sm:rounded-full`) 디자인
- **테마 전환기 (`ThemeToggle.tsx`)**:
  - `next-themes`의 `useTheme` 훅 연동
  - 다크 상태일 때 `Sun` 아이콘(Amber 액센트), 라이트 상태일 때 `Moon` 아이콘(Sky 액센트) 표시
- **반응형 제어**:
  - 데스크톱(`md:flex`): 아티클, 소개, 이력서, 이메일, 깃허브 전체 노출
  - 모바일(`md:hidden`): 공간 절약을 위해 우측 테마 토글 및 핵심 액션만 노출

### 4.2 모바일 바텀 네비게이션 (`src/components/MobileBottomNav.tsx`)
- **배치**: `fixed bottom-0 left-0 right-0 z-50 glass-panel border-t backdrop-blur-xl`
- **아이템 구성**:
  1. `아티클` (`BookOpen`): 홈 및 포스트 상세 진입 시 활성 표시
  2. `소개` (`User`): 소개 페이지 진입 시 활성 표시
  3. `이력서` (`FileText`): 외부 새 탭 링크
  4. `GitHub` (`GithubIcon`): 외부 프로필 링크
- **활성 상태 시각화**: `text-sky-600 dark:text-sky-400`, 아이콘 스케일업 및 우측 상단 미니 펄스 닷 표시

---

## 5. 표 $\rightarrow$ 반응형 카드 변환 시스템 (Table-to-Card Pattern)

모바일 화면에서 테이블의 가로 넘침(Horizontal Overflow)을 완전히 없애기 위해 마크다운 파서와 CSS 렌더러가 2단계로 협업합니다.

### 5.1 마크다운 파서 렌더러 (`src/lib/posts.ts`)
- 마크다운 파서(`marked`)에서 표 렌더링 시, 각 컬럼의 헤더명(`<th>` 텍스트)을 수집하여 각 행의 `<td>` 태그에 `data-label="컬럼명"` 속성을 자동 주입합니다.

### 5.2 반응형 CSS 렌더러 (`src/app/globals.css`)
- **데스크톱 (`>= 768px`)**:
  - 표준 `display: table` 그리드로 렌더링.
  - 헤더 `th`: `background: var(--table-th-bg)`, `color: var(--foreground)`.
  - 홀/짝수 행 교차 배경(`--table-tr-alt`) 지원.
- **모바일 (`< 768px`)**:
  - `thead`를 숨기고 각 행(`tr`)을 독립 카드(`display: block`, `background: var(--card-bg)`, `border: 1px solid var(--card-border)`)로 전환.
  - 각 셀(`td`)은 `display: flex; justify-content: space-between;`으로 배치되며, `::before` 가상 요소에 `content: attr(data-label)`을 주입하여 라벨과 값을 좌우 정렬 표시.

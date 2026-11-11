# domlog Design System Specification & Brief

> **Version**: 1.0.0  
> **Target**: `initbtn/blog` (Next.js 16 + Tailwind CSS v4 + React 19)  
> **Status**: Approved Blueprint

---

## 1. 개요 및 원칙

본 문서는 `domlog` 블로그의 반응형 레이아웃, 아이콘셋 표준, 테마(다크/라이트), 모바일 전용 컴포넌트(헤더, 바텀 캐러셀/네비게이션), 그리고 **표 $\rightarrow$ 카드 반응형 변환**을 일관되게 규정하는 정본 가이드라인입니다.

### 핵심 설계 원칙
1. **No Overflow-Scroll (모바일 스크롤 배제)**:
   - 가로로 넘쳐서 스크롤바가 생기는 데스크톱 지향 표를 모바일(`viewport < 768px`)에서는 세로 스택형 **독립 카드(Card Item)**로 자동 변환합니다.
2. **Dual-Theme Scalability (다크 기본 + 라이트 확장)**:
   - 개발자 엔지니어링 감성의 사이버틱 다크 테마(기본)와 가독성 중심의 라이트 테마 토큰을 1:1 대칭 정의합니다.
3. **Ergonomic Mobile UX (엄지손가락 반응형 UX)**:
   - 상단 헤더는 슬림화하고, 모바일 하단에 주요 탐색 및 인터랙티브 위젯(바텀 캐러셀/네비게이션)을 배치하여 한 손 조작성을 극대화합니다.
4. **Unified Icon System (단일 아이콘 규격)**:
   - `lucide-react`를 표준 아이콘 엔진으로 지정하고, 브랜딩/커스텀 아이콘(`GithubIcon` 등)은 동일한 뷰박스(24x24)와 스트로크(`strokeWidth={2}`) 규격을 준수합니다.

---

## 2. 디자인 토큰 매트릭스 (다크 / 라이트)

Tailwind CSS v4 CSS 변수 기반 테마 시스템 명세:

| 토큰명 | CSS 변수명 | Dark Theme (Default) | Light Theme | 용도 |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#090d16` (Deep Navy) | `#f8fafc` (Slate 50) | 전체 캔버스 배경 |
| **Foreground** | `--foreground` | `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) | 기본 본문 텍스트 |
| **Card Surface** | `--card` | `#0f172a` (Slate 900) | `#ffffff` (Pure White) | 포스트 카드, 표 변환 카드 |
| **Card Border** | `--border` | `#1e293b` (Slate 800) | `#e2e8f0` (Slate 200) | 분할선, 컴포넌트 경계 |
| **Muted Text** | `--muted` | `#94a3b8` (Slate 400) | `#64748b` (Slate 500) | 부가 설명, 메타데이터 |
| **Primary Accent**| `--accent` | `#38bdf8` (Sky 400) | `#0284c7` (Sky 600) | 하이라이트, 액티브 탭, 키캡 |
| **Warm Accent** | `--waffle` | `#f59e0b` (Amber 500) | `#d97706` (Amber 600) | 북마크, 배지, 서브 포인트 |

---

## 3. 아이콘셋 표준 규격 (Iconography)

1. **표준 라이브러리**: `lucide-react`
2. **크기 표준**:
   - `sm` (16px / `w-4 h-4`): 인라인 뱃지, 버튼 내부 레이블 아이콘
   - `md` (20px / `w-5 h-5`): 바텀 네비게이션, 모바일 탭 바
   - `lg` (24px / `w-6 h-6`): 헤더 액션, 모달 닫기
3. **스트로크 및 렌더링**:
   - `strokeWidth={2}` (일반), `strokeWidth={2.5}` (활성 탭)
   - 커스텀 SVG(예: `GithubIcon`)는 `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`를 준수하여 테마 색상을 직접 상속받도록 통일.

---

## 4. 모바일 반응형 헤더 & 바텀 캐러셀 명세

### 4.1 모바일 헤더 (`Header.tsx`)
- **높이 및 여백**: 모바일 `h-12` (상단 고정 패딩 축소) / 데스크톱 `h-14`
- **구조**:
  - Left: 로고 아바타 (32px) + 서비스명 `domlog`
  - Right: 테마 토글 버튼 (`Sun`/`Moon`) + 검색/채팅 런처
  - Center Desktop: 내비게이션 링크 (`md:flex`, 모바일에서는 숨김)

### 4.2 모바일 바텀 캐러셀 / 인터랙티브 덱 (`MobileBottomDeck.tsx`)
- **배치**: `fixed bottom-0 left-0 right-0 z-50`
- **모드 전환**:
  1. **네비게이션 모드 (기본)**: 아티클, 소개, 이력서, 깃허브 탭
  2. **아티클 리딩 모드 (포스트 상세 진입 시)**:
     - 하단 바텀 캐러셀로 **연관 아티클 스와이프** 또는 **문제 풀이 덱(Quiz Deck) 미니 컨트롤러** 표시
     - 좌우 스와이프 제스처(`touch-action: pan-x`, CSS `scroll-snap-type: x mandatory`)를 통한 가벼운 캐러셀 탐색

---

## 5. 표 $\rightarrow$ 반응형 카드 변환 시스템 (Table-to-Card Pattern)

모바일에서 표의 가로 넘침(Horizontal Overflow)을 완전히 없애기 위해, 마크다운 파서와 CSS 렌더러가 2단계로 협업합니다.

### 5.1 마크다운 파서 렌더러 (`src/lib/posts.ts`)
- 마크다운 파서(`marked`)에서 표 렌더링 시, 각 컬럼의 헤더명(`<th>` 텍스트)을 수집하여 각 행의 `<td>` 태그에 `data-label="컬럼명"` 속성을 자동 주입.

```html
<!-- 데스크톱 & 모바일 공통 시맨틱 HTML -->
<table class="responsive-table">
  <thead>
    <tr>
      <th>구분</th>
      <th>LOC</th>
      <th>기능점수(FP)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="구분">측정 기준</td>
      <td data-label="LOC">코드 라인 수</td>
      <td data-label="기능점수(FP)">사용자 관점 기능 수</td>
    </tr>
  </tbody>
</table>
```

### 5.2 CSS 미디어 쿼리 트랜스폼 (`src/app/globals.css`)

```css
/* Desktop View (>= 768px): 표준 그리드 테이블 */
@media (min-width: 768px) {
  .prose table {
    display: table;
    width: 100%;
  }
}

/* Mobile View (< 768px): 카드 리스트 트랜스폼 */
@media (max-width: 767px) {
  .prose table {
    display: block;
    width: 100%;
    border: none;
    background: transparent;
  }

  .prose thead {
    display: none; /* 헤더 행 숨김 */
  }

  .prose tbody {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .prose tr {
    display: block;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
  }

  .prose td {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
    font-size: 0.875rem;
    text-align: right;
  }

  .prose td:last-child {
    border-bottom: none;
  }

  /* 헤더 라벨 의사 요소 자동 주입 */
  .prose td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--accent);
    text-align: left;
    margin-right: 1rem;
    flex-shrink: 0;
  }
}
```

---

## 6. 구현 마일스톤 및 체크리스트

- [ ] **Phase 1: Table-to-Card 파서 & CSS 구현**
  - `marked` 커스텀 테이블 렌더러에 `data-label` 주입 로직 추가
  - `globals.css` 모바일 트랜스폼 CSS 규칙 적용
- [ ] **Phase 2: 다크/라이트 테마 토글 체계화**
  - `next-themes` 기반 `ThemeProvider` 및 헤더 토글 버튼 연동
  - `--background`, `--card`, `--foreground` 색상 변수 다크/라이트 세팅
- [ ] **Phase 3: 모바일 헤더 슬림화 & 바텀 캐러셀 인터랙션 고도화**
  - 모바일 헤더 터치 영역 최적화
  - 하단 스와이프형 캐러셀 컴포넌트 규격 적용

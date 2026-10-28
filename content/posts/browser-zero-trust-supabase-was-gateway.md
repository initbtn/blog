---
title: "브라우저에 Supabase 접속 정보를 한 글자도 두지 않는 법: Vercel WAS 게이트웨이와 제로 트러스트 번들 격리"
slug: "browser-zero-trust-supabase-was-gateway"
date: "2026-10-29"
summary: "정적 SPA 번들에 VITE_SUPABASE_URL과 ANON_KEY를 포함시키는 흔한 관행을 버리고, Vercel Serverless WAS 게이트웨이를 구축해 브라우저 번들에서 데이터베이스 SDK와 도메인을 완전히 지워낸 트러블슈팅 및 아키텍처 기록입니다."
tags: ["Security", "Architecture", "ZeroTrust", "Supabase", "Vercel", "Vue.js"]
draft: false
---

## 1. 계기: "Anon Key니까 프론트에 노출되어도 괜찮다?"

Supabase나 Firebase 같은 BaaS(Backend-as-a-Service)의 공식 문서를 보면 흔히 다음과 같은 코드가 기본 튜토리얼로 등장합니다.

```typescript
// 흔히 보는 클라이언트 초기화 방식
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

문서에서는 RLS(Row Level Security)를 켜두면 익명 키(Anon Key)가 브라우저에 노출되어도 권한 테이블 규칙에 의해 안전하다고 안내합니다.

하지만 프로덕션 시스템을 고민하는 엔지니어의 시각에서 이것은 타협하기 어려운 보안상의 찜찜함을 남깁니다.

1. **DB 엔드포인트 도메인 노출:** 프로덕션 DB 호스트(`*.supabase.co`)가 브라우저 개발자 도구의 Network 탭과 번들 JS 파일에 평문으로 남습니다. 공격자는 서비스 인프라의 공급자와 백엔드 프로젝트 ID를 즉시 특정할 수 있습니다.
2. **RLS 정책 누락 시 치명적 참사:** 개발자가 실수로 특정 신규 테이블의 RLS를 누락하거나 잘못된 `USING (true)` 정책을 배포하는 순간, 노출된 익명 키를 이용해 브라우저 콘솔에서 테이블 전체를 긁어가거나 변조할 수 있습니다.
3. **클라이언트 번들 비대화:** 브라우저가 직접 Supabase PostgREST 엔진과 대화하기 위해 `@supabase/supabase-js` 라이브러리를 포함해야 하므로 수십~수백 킬로바이트의 번들 오버헤드가 발생합니다.

"클라이언트 브라우저는 잠재적으로 언제든 공격자의 손에 넘어갈 수 있는 신뢰할 수 없는(Untrusted) 환경이다."

이 대전제 아래, **브라우저 JS 번들에는 데이터베이스 접속 URL, API 키, 그리고 Supabase SDK 패키지 자체를 단 1바이트도 포함하지 않는 완전한 제로 트러스트(Zero Trust) 구조**를 만들기로 결정했습니다.

---

## 2. 목표와 구조: WAS 단일 게이트웨이 아키텍처

우리가 달성하고자 한 설계 목표는 세 가지였습니다.

- **도메인 격리:** 브라우저 번들을 아무리 `grep`해도 `supabase.co` 문자열이 단 1개도 검출되지 않을 것.
- **번들 다이어트:** 클라이언트 번들에서 `@supabase/supabase-js` 런타임 의존성을 100% 제거할 것.
- **서버리스 WAS 게이트웨이:** 클라이언트는 오직 오리진 서버의 `/api/*` 엔드포인트와만 순수 JSON 통신을 수행할 것.

이를 위해 Vercel Serverless Function을 단일 공개 진입점(WAS 게이트웨이)으로 배치하고 다음과 같이 데이터 흐름을 격리했습니다.

```
[클라이언트 브라우저 (Vue 3 SPA)]
       │
       │ 1. fetch('/api/resume')  (순수 JSON 요청, DB 지식 전무)
       ▼
[Vercel Serverless WAS Gateway]  <-- 환경변수 격리 (SUPABASE_URL, SERVICE_ROLE_KEY)
       │
       │ 2. 서버 SDK로 안전하게 Supabase PostgreSQL 질의
       ▼
[Supabase DB / Connection Pooler]
```

---

## 3. 구현 단계: 프론트엔드와 백엔드의 외과적 분리

### 단계 1: WAS Serverless 엔드포인트 구현

먼저 백엔드 영역인 `api/resume.ts`에 서버리스 핸들러를 구성했습니다.
여기서는 Node.js 런타임 환경에서만 환경변수(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 또는 안전한 `SUPABASE_ANON_KEY`)를 읽어와 DB 쿼리를 수행합니다.

```typescript
// api/resume.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseUrl || !supabaseKey) {
    // 환경변수 부재 시 즉시 안전한 정적 폴백 반환
    return res.status(200).json({ source: 'fallback' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('resume_profiles').select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data, source: 'database' });
}
```

이제 Supabase 자격증명은 Vercel 서버의 메모리에만 존재하며 브라우저 네트워크로는 결코 나가지 않습니다.

### 단계 2: 클라이언트 추상화 (`apiClient.ts`)

클라이언트 코드에서는 Supabase 클라이언트를 직접 import하지 않고, 경량의 `fetch` 래퍼만을 사용하도록 교체했습니다.

```typescript
// src/lib/apiClient.ts
export async function fetchResumeFromGateway(): Promise<ResumePayload | null> {
  try {
    const res = await fetch('/api/resume', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch {
    return null; // 네트워크 단절 시 로컬 정적 페이로드 자동 폴백
  }
}
```

### 단계 3: 번들 오염의 주범 제거 (Type-only import)

이 과정에서 겪었던 재미있는 트러블슈팅이 있었습니다.
분명 코드에서 `createClient` 호출부를 모두 지웠는데도 프로덕션 빌드 파일(`dist/assets/*.js`)을 검색해보니 여전히 Supabase 관련 내부 클래스들이 번들에 번들링되어 있었습니다.

원인을 추적해보니 Composable 파일(`useResumeData.ts`) 상단에 남겨져 있던 **런타임 import 구문** 때문이었습니다.

```typescript
// ❌ 번들에 supabase-js 런타임 코드가 끌려들어감
import { supabase, TypedSupabaseClient } from '@/lib/supabase';

// ✅ 타입 전용 import로 교체하여 런타임 번들에서 100% 증발시킴
import type { TypedSupabaseClient } from '@/types/supabase';
```

Vite 번들러는 런타임 객체 참조가 존재하면 트리쉐이킹을 하지 않고 번들에 포함시킵니다.
이를 `import type`으로 명확히 분리하고 더미 클라이언트 주입 방식을 도입함으로써 의존성을 완전히 도려낼 수 있었습니다.

---

## 4. 결과와 검증: 실측 지표

작업을 완료한 후, 자동화된 정량 검증을 수행했습니다.

### ① 번들 내 문자열 전수 검사
```bash
grep -rn "supabase.co" dist/
# 결과: 0 matches (완전 격리 성공)
```

### ② 프로덕션 번들 크기 절감
- 리팩터링 전: 약 **182 kB**
- 리팩터링 후: **126.42 kB** (**약 30.5% 경량화**)
- 불필요한 BaaS SDK 제거로 First Contentful Paint(FCP) 로딩 시간 단축.

### ③ 보안 등급 향상
브라우저를 열고 F12 개발자 도구의 Application 스토리지, Source 탭, Network 트래픽을 모두 분석해도 회사의 데이터베이스 주소나 인프라 벤더 정보를 일절 파악할 수 없는 폐쇄형 아키텍처를 구축했습니다.

---

## 5. 결론 및 인사이트

편리함과 보안 사이의 트레이드오프에서, "BaaS니까 어쩔 수 없다"는 생각으로 프론트엔드에 접속 키를 맡기는 것은 손쉬운 지름길일 수 있습니다.

하지만 Vercel이나 Cloudflare Workers 같은 현대 서버리스 게이트웨이를 얇은 단일 진입점(BFF / WAS Gateway)으로 두는 것만으로도, **자격증명 제로 트러스트 격리**, **30% 번들 경량화**, **정적 데이터 자동 폴백 내결함성**이라는 세 마리 토끼를 모두 잡을 수 있었습니다.

이 구조는 이후 해양 센서 GIS 대시보드와 AI sLM RAG 프로젝트에서도 동일한 보안 아키텍처 원칙으로 계승되어 안전한 시스템의 뼈대가 되었습니다.

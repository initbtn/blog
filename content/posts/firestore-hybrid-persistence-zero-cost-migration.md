---
title: "Cloud Firestore와 인메모리 듀얼 레이어로 완성하는 0원 실시간 채팅 영속화"
slug: "firestore-hybrid-persistence-zero-cost-migration"
date: "2026-11-01"
summary: "서버리스 WAS는 요청이 끝나면 메모리를 잃고, 타이핑 이벤트까지 DB에 쓰면 비용과 지연이 폭발합니다. 타이핑은 RAM에, 대화록은 Cloud Firestore 서브컬렉션에 fire-and-forget으로 적재하는 Hot/Cold 듀얼 레이어와, 환경변수 하나로 독립 DB로 옮길 수 있는 0원 설계를 실제 코드로 정리합니다."
tags: ["Firestore", "NoSQL", "Serverless", "Architecture", "FreeTier", "Next.js", "GCP"]
draft: false
---

> **BaaS 없이 구축하는 제로 트러스트 실시간 채팅 아키텍처 — 4부작 시리즈**
> 1편 [WAS ↔ 텔레그램 봇 릴레이](/posts/zero-secret-realtime-telegram-chatbot-was) · 2편 [소켓 vs SSE vs 폴링, 그리고 쓰로틀링](/posts/realtime-chat-architecture-throttling-was-nosql) · **3편 NoSQL 하이브리드 영속화와 0원 설계** · 4편 [포럼 토픽 격리와 점진적 온보딩 UX](/posts/telegram-forum-topics-conan-progressive-onboarding)

## 1. 계기: 재배포 한 번에 대화가 사라졌다

1편에서 만든 채팅 릴레이는 Next.js 서버리스 WAS의 메모리 `Map` 하나가 전부였습니다. 독자가 메시지를 보내면 `Map`에 쌓고, 상담사 대시보드와 독자 위젯이 이를 폴링해 가져가는 구조입니다. 지연은 사실상 0ms였고, 데모에서는 완벽했습니다.

문제는 서버리스의 본질에서 왔습니다.

* 컨테이너는 유휴 상태가 되면 회수되고, 재배포 때도 새로 뜹니다. **프로세스 메모리는 영속 저장소가 아닙니다.**
* 새 컨테이너가 뜨는 순간 `Map`은 비어 있고, 어제 나눈 대화는 대시보드에서 흔적도 없이 사라집니다.
* 같은 시점에 인스턴스가 둘 이상 떠 있으면 서로 다른 `Map`을 보게 됩니다.

그렇다고 모든 것을 DB에 쓰자니 반대편 함정이 기다립니다. 2편에서 다뤘듯 상담사가 키를 누를 때마다 발생하는 **타이핑 이벤트**는 초당 수 건씩 쏟아지는 극도로 휘발성인 데이터입니다. 이걸 매번 DB에 쓰면 두 가지가 동시에 터집니다.

1. **비용**: 쓰기 과금 단위 서비스에서는 타이핑 하나하나가 곧 청구 항목이 됩니다. 무료 할당량(후술)은 한나절이면 바닥납니다.
2. **지연**: 네트워크 왕복이 낀 DB 쓰기는 수십~수백 ms입니다. "입력 중..." 표시가 입력이 끝난 뒤에 뜨는 모순이 생깁니다.

요구사항은 이렇게 정리됐습니다. **"대화록은 살아남아야 하고, 타이핑은 DB 근처에도 가지 말아야 하며, 월 비용은 0원이어야 한다."**

---

## 2. 왜 Realtime Database가 아니라 Cloud Firestore인가

Firebase에는 NoSQL이 둘 있습니다. 둘 다 "실시간"을 내세우지만 데이터 모델이 전혀 다릅니다.

| 구분 | Realtime Database (RTDB) | Cloud Firestore |
| :--- | :--- | :--- |
| 데이터 모델 | 하나의 거대한 JSON 트리 | 컬렉션 ⊃ 문서 ⊃ 서브컬렉션 |
| 조회 | 경로 단위. 정렬·필터 한 가지 위주 | 인덱스 기반 쿼리, `orderBy` + `limit` |
| 과금 단위 | 저장 용량 + 다운로드 대역폭 | 문서 읽기/쓰기/삭제 횟수 + 저장 용량 |
| 부분 조회 | 하위 노드를 읽으면 그 가지 전체가 딸려옴 | 문서 단위. 서브컬렉션은 부모를 읽어도 안 딸려옴 |

이 프로젝트에서 결정적이었던 것은 두 번째 줄과 네 번째 줄입니다.

**대화 로그는 "세션 하나에 메시지가 계속 늘어나는" 구조입니다.** RTDB에서 `sessions/{id}`를 읽으면 그 아래 쌓인 메시지 전체가 한 번에 따라옵니다. 대화가 길어질수록 세션 목록 하나 그리는 데에도 모든 메시지를 내려받게 됩니다. 반대로 Firestore는 메시지를 서브컬렉션으로 분리하면 세션 메타데이터만 가볍게 읽을 수 있고, 메시지는 필요할 때 `orderBy('timestamp')` + `limit`으로 **페이지 단위**로 가져올 수 있습니다.

```
domlog_chat_sessions/{sessionId}                ← 세션 메타 (이름, 연락처, lastActiveAt ...)
domlog_chat_sessions/{sessionId}/messages/{messageId}   ← 메시지 1건 = 문서 1개
```

또 메시지를 문서 하나로 쓰면 **Append-Only**가 자연스럽습니다. 기존 문서를 수정하지 않고 새 문서를 추가하기만 하므로 같은 세션에 메시지가 동시에 들어와도 서로 덮어쓸 일이 없습니다. 2편에서 말한 "잠금 없는 적재"가 문서 모델 위에서 그대로 성립합니다.

> 비용 면에서도 RTDB가 손해만은 아닙니다. 구글 공식 가이드는 작은 연산이 아주 많은 앱에서는 Firestore가 RTDB보다 비쌀 수 있다고 안내합니다. RTDB가 나쁜 선택이라는 뜻은 아닙니다. 프레즌스나 커서 위치처럼 **작고 휘발적인 상태를 극저지연으로 동기화**하는 용도에는 지금도 좋습니다. 다만 이 글의 목적은 "쌓이는 대화록을 싸고 쿼리 가능하게 보관"하는 것이고, 거기에는 문서-컬렉션 모델이 맞았습니다. (그리고 타이핑 상태는 어차피 둘 다 쓰지 않습니다. 4장 참고.)

---

## 3. 0원 인프라 아키텍처

### Always Free 할당량

Firestore는 프로젝트의 **첫 번째 데이터베이스**(ID는 무관)에 대해 **매일 갱신되는 무료 할당량**(태평양 시간 자정 무렵 초기화)을 줍니다. 같은 프로젝트에 만드는 두 번째 데이터베이스부터는 사용량이 과금됩니다.

| 항목 | 일일 무료 한도 |
| :--- | :--- |
| 문서 읽기 | 50,000건 |
| 문서 쓰기 | 20,000건 |
| 문서 삭제 | 20,000건 |
| 저장 용량 | 1 GiB (총량) |

여기에 한 가지 계산을 얹어 보겠습니다. 메시지 1건을 저장할 때 우리 코드는 **세션 메타 upsert 1회 + 메시지 문서 1회 = 쓰기 2건**을 씁니다. 즉 이론상 하루 약 1만 건의 메시지까지 무료입니다. 1인 블로그의 상담 채팅이 이 한도를 넘길 일은 사실상 없습니다. 그리고 만약 타이핑 이벤트까지 DB에 썼다면? 상담사 한 명이 한 번 답변하는 동안에만 수십 건이 나가 한도의 절반이 하루 만에 증발했을 겁니다. **RAM에 두는 설계가 곧 비용 설계**입니다.

리전은 `nam5`(미국 멀티리전)에 `(default)` 데이터베이스를 만들었습니다. 무료 할당량 수치 자체는 리전에 따라 달라지지 않지만, 리전별 단가표는 따로 있으니 유료 구간에 들어갈 때는 확인이 필요합니다. 한국에서 접속하면 왕복 지연이 있지만, 이 지연은 5장에서 보듯 **사용자 응답 경로 밖**에 있어서 체감되지 않습니다.

### 최소 권한 서비스 계정

브라우저에는 어떤 Firebase SDK도, 키도 내려가지 않습니다. Firestore를 건드리는 곳은 오직 서버리스 WAS뿐이고(**단일 WAS 게이트웨이 원칙**), 전용 서비스 계정에는 `roles/datastore.user` 하나만 부여했습니다. 이 역할은 문서 읽기/쓰기만 허용하고 인덱스·DB 설정 변경은 못 합니다. 키가 유출돼도 피해 범위가 "채팅 문서 읽기/쓰기"로 한정됩니다. 키는 base64로 인코딩해 Vercel 환경변수(`GCP_SA_KEY_BASE64`)로만 주입하고 저장소에는 두지 않습니다.

### 네임스페이스 격리

무료 할당량은 프로젝트당 데이터베이스 **한 개**에만 걸리고, 지금은 그 자리를 `(default)`가 차지합니다. 그래서 블로그 채팅 전용 컬렉션 이름을 `domlog_chat_sessions`로 고정하고, 다른 용도의 데이터와 섞이지 않게 **컬렉션 이름으로 격리**했습니다. 이 한 가지 결정이 다음 장의 이전 전략을 가능하게 만듭니다.

---

## 4. 독립 DB 마이그레이션 호환 설계

"지금은 `(default)`에 얹어 두지만, 트래픽이 늘거나 다른 서비스와 분리하고 싶어지면?"을 대비해 이전 비용을 처음부터 0에 가깝게 만들었습니다. 다만 **코드 수정이 0이라는 뜻이지 요금이 0이라는 뜻은 아닙니다.** 같은 프로젝트에 두 번째 DB를 만들면 그 DB는 무료 할당량 밖이라 과금되므로, 무료로 이어가려면 새 DB를 별도 프로젝트에 두는 편이 안전합니다. (프로젝트가 바뀌면 `GCP_PROJECT_ID`도 함께 바꿔야 합니다.)

### (1) 코드 무수정: `FIRESTORE_DATABASE_ID`

```ts
// src/lib/firestore.ts
const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'waffle-dominic';
const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

const settings: Settings = { projectId, databaseId };
```

데이터베이스 ID를 코드에 박지 않고 환경변수로 뺐습니다. 독립 DB를 새로 만든 뒤 `FIRESTORE_DATABASE_ID=blog-chat` 한 줄만 바꾸고 재배포하면 쓰기·읽기 대상이 통째로 바뀝니다. 접근 지점이 `getFirestore()` 싱글톤 하나뿐이라 바꿀 곳도 한 군데입니다.

컬렉션 이름도 같은 사고입니다. 상수로 한곳에 모아 두었습니다.

```ts
export const FIRESTORE_COLLECTIONS = {
  SESSIONS: 'domlog_chat_sessions',
  MESSAGES: 'messages',
} as const;
```

### (2) 데이터 이전: 컬렉션 단위 Export/Import

기존 데이터도 옮겨야 한다면, 네임스페이스를 격리해 둔 덕에 해당 컬렉션만 골라 내보낼 수 있습니다.

```bash
# 1) 채팅 컬렉션만 내보내기 (서브컬렉션 messages 포함)
gcloud firestore export gs://<버킷>/chat-export \
  --database='(default)' \
  --collection-ids=domlog_chat_sessions,messages

# 2) 새 독립 DB로 가져오기
gcloud firestore import gs://<버킷>/chat-export/<타임스탬프> \
  --database=blog-chat
```

두 가지는 미리 알아 둬야 합니다.

* `--collection-ids`는 **컬렉션 그룹 ID** 기준이라 서브컬렉션 이름(`messages`)도 함께 적어야 합니다.
* export/import는 Cloud Storage 버킷을 거치므로 **결제 계정 연결(Blaze)이 필요**합니다. 일상 운영은 무료 한도 안에서 0원이지만, 이전 작업을 할 때는 결제 계정을 붙여야 합니다. 쓴 만큼만 과금되고 이 규모에서는 사실상 센트 단위 이하이지만, "결제 수단이 전혀 필요 없다"는 뜻은 아닙니다.

---

## 5. 하이브리드 성능 최적화: Hot Path vs Cold Path

핵심 아이디어는 데이터를 **수명과 가치**로 둘로 나누는 것입니다.

| | Hot Path | Cold Path |
| :--- | :--- | :--- |
| 대상 | 타이핑 상태, 폴링으로 읽는 최신 메시지 | 확정된 대화 메시지, 세션 메타 |
| 저장소 | 인메모리 `Map` | Firestore 서브컬렉션 |
| DB 쓰기 | **0회** | 메시지당 2회 |
| 사용자 응답 | 즉시 | 응답을 **기다리지 않음** |

### (1) 타이핑: RAM에만, 6초 뒤 자동 만료

```ts
export function setAdminTyping(sessionId: string, isTyping: boolean) {
  const session = store.get(sessionId.trim());
  if (session) {
    session.status = isTyping ? 'typing' : 'idle';
    session.lastTypingAt = isTyping ? Date.now() : undefined;
  }
}
```

타이핑 이벤트는 `Map`의 필드 두 개만 갱신하고 끝입니다. DB도, 네트워크도 건드리지 않습니다. 여기서 중요한 것은 **만료 처리**입니다. 상담사가 입력창에서 손을 떼고 탭을 닫아 버리면 "입력 해제" 이벤트가 영영 오지 않을 수 있습니다. 그래서 독자가 상태를 읽는 순간에 지연 평가(lazy expiration)합니다.

```ts
// getMessagesSince() 안에서
if (session.status === 'typing' && session.lastTypingAt && Date.now() - session.lastTypingAt > 6000) {
  session.status = 'idle';
}
```

별도 타이머도, 스위퍼도 필요 없습니다. 마지막 입력 후 6초가 지나면 읽는 쪽에서 `idle`로 되돌립니다. 이 동작은 단위 테스트(`타이핑 상태는 6초가 경과하면 자동으로 idle로 복귀해야 한다`)로 고정해 두었습니다.

### (2) 대화록: Fire-and-forget 비동기 쓰기

메시지가 도착하면 먼저 **RAM에 넣고 응답을 돌려준 다음**, 영속화는 뒤에서 따로 돕니다.

```ts
session.messages.push(msg);

// 응답 경로를 막지 않는다
persistSessionAndMessageAsync(session, msg).catch(() => {});

return msg;
```

`persistSessionAndMessageAsync`는 `await` 하지 않고 호출만 합니다. 내부에서는 세션 문서를 `set(..., { merge: true })`로 upsert하고, 메시지는 `messages/{messageId}` 문서로 **새로 추가**합니다. Firestore 왕복이 100ms든 500ms든 사용자는 자기 메시지가 올라가는 속도에 영향을 받지 않습니다. 쓰기가 실패해도 `try/catch`에서 로그만 남기고 삼키므로, **Firestore 장애가 채팅 자체를 죽이지 않습니다.** 자격 증명이 없으면 `getFirestore()`가 `null`을 돌려주고 인메모리만으로 동작합니다. 로컬 개발이 키 없이도 되는 이유입니다.

### (3) 콜드 스타트 복원

새 컨테이너가 떠서 `Map`이 비어 있을 때, 대시보드 API가 Firestore에서 세션을 되살립니다.

```ts
// src/app/api/admin/chat/route.ts
let sessions = getAllSessions();
if (sessions.length === 0) {
  sessions = await syncSessionsFromFirestore();
}
```

`syncSessionsFromFirestore()`는 `lastActiveAt` 내림차순으로 최근 세션 50개를 읽고, 메모리에 없는 세션만 골라 `messages` 서브컬렉션을 `timestamp` 오름차순으로 읽어 `Map`에 채웁니다. **이미 메모리에 있는 세션은 건드리지 않으므로** 살아 있는 인스턴스의 최신 상태를 DB의 옛 값이 덮어쓰지 않습니다. 복원된 세션의 타이핑 상태는 항상 `idle`로 시작합니다. 휘발성 데이터는 복원 대상이 아니기 때문입니다.

---

## 6. 한계와 다음 단계 (솔직한 정리)

이 설계는 "1인 블로그 규모에서 0원으로 충분히 믿을 만한" 지점을 노린 것이고, 아래 한계를 알고 선택한 트레이드오프입니다.

1. **서버리스에서의 fire-and-forget은 보장이 아닙니다.** 응답을 돌려준 직후 플랫폼이 컨테이너를 동결하면 진행 중이던 쓰기가 끊길 수 있습니다. 그 경우 메시지 하나가 영속화되지 않습니다. 유실이 용납되지 않는다면 Vercel의 `waitUntil`(응답 후 백그라운드 작업 유지) 계열 API로 감싸거나, 쓰기를 응답 경로에서 `await` 하는 쪽으로 바꿔야 합니다. 지금은 지연 0ms와 단순함을 우선했습니다.
2. **복원은 "메모리가 완전히 비었을 때" 대시보드 경로에서만 일어납니다.** 독자 위젯의 폴링 경로(`getMessagesSince`)는 복원을 하지 않습니다. 인스턴스가 여러 개 떠 있으면 서로 다른 `Map`을 볼 수 있습니다. 실시간 정합성이 정말 필요해지면 그때는 Redis 같은 공유 상태나 Firestore 리스너로 올라가야 합니다.
3. **세션 복원은 최근 50개로 제한**됩니다. 오래된 대화는 DB에 남아 있지만 대시보드 첫 화면에는 올라오지 않습니다.

---

## 7. 마치며: 3부작을 닫으며

세 편을 관통하는 원칙은 하나였습니다. **"데이터의 수명에 맞는 곳에 둔다."**

* **휘발성 이벤트(타이핑)** → RAM. DB 쓰기 0회, 6초면 스스로 만료.
* **확정된 대화록** → Firestore 서브컬렉션. Append-Only, 비동기, 장애가 나도 채팅은 계속.
* **이전 가능성** → 환경변수 하나(`FIRESTORE_DATABASE_ID`)와 격리된 컬렉션 이름.
* **보안** → 브라우저에는 SDK도 키도 없고, `roles/datastore.user` 하나만 쥔 WAS가 유일한 통로.

결과적으로 BaaS 대시보드에 종속되지 않고, 청구서도 0원이며, 나중에 옮기고 싶어지면 환경변수를 바꾸고 컬렉션을 내보내면 되는 구조가 됐습니다. 거창한 메시지 브로커 없이도 "작고 단단한" 실시간 채팅은 충분히 만들 수 있습니다.

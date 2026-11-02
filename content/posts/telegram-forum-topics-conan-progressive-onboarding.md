---
title: "텔레그램 포럼 토픽 격리와 코난 코드명 온보딩으로 완성하는 0원 실시간 챗봇"
slug: "telegram-forum-topics-conan-progressive-onboarding"
date: "2026-11-03"
summary: "단일 텔레그램 채팅방에 모든 방문자 세션이 섞이던 문제를 Forum Supergroup Topics(createForumTopic)와 thread_id로 1:1 완전 격리하고, 명탐정 코난 코드명 익명 페르소나 및 1차 질의 후 점진적 온보딩 UX로 완성한 월 0원 실시간 챗봇 완결편 아키텍처를 정리합니다."
tags: ["Telegram", "Chatbot", "UX", "Architecture", "Serverless", "Next.js", "Webhooks"]
draft: false
---

> **BaaS 없이 구축하는 제로 트러스트 실시간 채팅 아키텍처 — 4부작 완결편**
> 1편 [WAS ↔ 텔레그램 봇 릴레이](/posts/zero-secret-realtime-telegram-chatbot-was) · 2편 [소켓 vs SSE vs 폴링, 그리고 쓰로틀링](/posts/realtime-chat-architecture-throttling-was-nosql) · 3편 [NoSQL 하이브리드 영속화와 0원 설계](/posts/firestore-hybrid-persistence-zero-cost-migration) · **4편 포럼 토픽 격리와 점진적 온보딩 UX**

---

## 1. 계기: 세션이 뒤섞이는 단일 챗방과 이탈을 부르는 입력 폼

3편까지 구축한 챗봇은 매우 훌륭하게 동작했습니다. Next.js 서버리스 WAS에서 인메모리 버퍼와 Cloud Firestore 듀얼 레이어로 세션을 영속화했고, 텔레그램 Bot API를 통해 블로그 관리자의 스마트폰으로 실시간 알림과 양방향 응답이 전달되었습니다. 인프라 비용은 여전히 월 0원이었습니다.

하지만 프로덕션 환경에 배포하고 실제 독자들의 문의를 받기 시작하자, 데모에서는 보이지 않던 두 가지 치명적인 병목이 드러났습니다.

### 문제 1: 단일 텔레그램 채팅방의 세션 뒤섞임 (Context Pollution)
초기 설계에서는 관리자의 텔레그램 단일 채팅방(`chat_id`)으로 모든 방문자의 문의가 쏟아졌습니다.
* 독자 A가 "포스팅 잘 봤습니다"라고 보내고, 독자 B가 "컨설팅 문의드립니다"라고 보냈을 때 관리자가 텔레그램에서 답장을 치면, 누구에게 보낸 답장인지 봇이 구분할 수 없었습니다.
* 답장 인용(Reply to message) 파싱을 추가하더라도 관리자가 여러 독자와 동시에 대화를 나눌 때 스레드가 얽혀 엉뚱한 독자에게 답장이 튀는 위험이 상존했습니다.

### 문제 2: 진입 장벽 높은 사전 프로필 입력 폼
위젯을 열자마자 "이름, 이메일, 연락처를 입력해야 대화를 시작할 수 있습니다"라는 모달을 띄웠더니, 대다수의 방문자가 글만 읽고 챗봇 창을 닫아버렸습니다.
* 기술 블로그 방문자는 가볍게 질문 하나를 던지고 싶을 뿐인데, 개인정보를 먼저 요구받는 순간 이탈률이 급증합니다.
* 그렇다고 완전 익명으로만 두면 관리자가 나중에 이메일이나 유선으로 팔로업을 진행할 수 없는 딜레마가 발생했습니다.

우리가 필요로 했던 것은 **"방문자별로 완전히 독립된 1:1 대화 쓰레드를 텔레그램 내에서 관리할 수 있으면서, 첫 진입 장벽은 0으로 낮추고 점진적으로 정보를 수집하는 UX"**였습니다.

---

## 2. 텔레그램 포럼 토픽(Forum Topics): 방문자 세션별 1:1 완전 격리

텔레그램은 슈퍼그룹(Supergroup)에 **포럼(Topics)** 기능을 제공합니다. 슬랙(Slack)의 채널이나 디스코드(Discord)의 포럼 채널처럼, 하나의 그룹 안에서 주제별로 서브 스레드를 무제한에 가깝게 개설할 수 있습니다.

Telegram Bot API 6.3 이상에서는 이 기능을 제어할 수 있는 API를 지원합니다:
- `createForumTopic`: 새로운 주제 스레드 생성 (반환값: `message_thread_id`)
- `editForumTopic`: 스레드 이름 및 아이콘 실시간 수정
- `sendMessage(chat_id, text, message_thread_id)`: 특정 토픽으로 메시지 라우팅

### 세션 생명주기와 토픽 생성 흐름

독자가 블로그 위젯에서 대화를 시작할 때의 아키텍처 흐름입니다:

```
[방문자 브라우저]               [Next.js WAS]              [Cloud Firestore]          [Telegram Supergroup]
       │                            │                            │                            │
       │─── 1. 첫 메시지 전송 ─────>│                            │                            │
       │                            │─── 2. createForumTopic ────────────────────────────────>│
       │                            │<── 3. message_thread_id ────────────────────────────────│
       │                            │                                                         │
       │                            │─── 4. 세션 메타 저장 ──────>│                            │
       │                            │    (telegramTopicId)       │                            │
       │                            │                                                         │
       │                            │─── 5. 토픽에 알림 전송 ─────────────────────────────────>│
       │                            │    (새 방문자 문의 도착)                                  │
```

Next.js 백엔드 API에서 구현한 토픽 생성 및 전송 로직의 핵심입니다:

```typescript
// src/app/api/contact/route.ts
const topic = await telegramRequest('createForumTopic', {
  chat_id: TELEGRAM_GROUP_ID,
  name: `[${topicIcon}] ${visitorName} #${topicNumber}`,
  icon_color: 7322096, // Telegram 테마 컬러
});

if (topic?.message_thread_id) {
  // 세션 스토어에 message_thread_id 바인딩
  await chatStore.updateSession(sessionId, {
    telegramTopicId: topic.message_thread_id,
  });

  // 해당 토픽으로만 첫 안내 메시지 발행
  await telegramRequest('sendMessage', {
    chat_id: TELEGRAM_GROUP_ID,
    message_thread_id: topic.message_thread_id,
    text: `🚀 새로운 방문자 세션이 시작되었습니다.\n- 이름: ${visitorName}\n- 세션 ID: ${sessionId}`,
  });
}
```

관리자는 텔레그램 앱에서 각 독자별로 생성된 독립 탭(Topic)으로 들어가 대화를 나눕니다. 독자 A의 탭에서 작성한 메시지는 `message.message_thread_id`를 헤더에 달고 웹훅으로 들어오므로, 다른 독자에게 메시지가 섞여 들어갈 여지가 물리적으로 차단됩니다.

---

## 3. 익명 페르소나와 점진적 온보딩(Progressive Profiling)

진입 장벽을 없애기 위해 **명탐정 코난의 검은조직 코드명**을 차용했습니다.

* 방문자가 챗봇을 열면 임의의 코드명(럼, 진, 워커, 베르무트, 키안티, 코른, 버본, 라이 등 15종)이 자동으로 부여됩니다.
* 방문자는 아무런 사전 입력 없이 즉시 궁금한 점을 질문합니다.
* 텔레그램 포럼에는 즉시 `[코드명: 럼]`이라는 이름으로 토픽이 생성되어 관리자가 실시간으로 응답할 수 있습니다.

### 첫 질문 직후의 점진적 온보딩 카드

방문자가 첫 질문을 전송하고 나면, 챗봇 대화창 하단에 부드럽게 **인라인 온보딩 카드**가 나타납니다:

> "initbtn 엔지니어에게 질문이 전달되었습니다! 답변 알림을 받으실 연락처를 남겨주시면 세션이 끊겨도 이메일/문자로 회신드립니다."

```typescript
// src/components/FloatingChatBot.tsx
{showProfileForm && (
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
    <p className="font-semibold text-zinc-700 dark:text-zinc-300">
      회신받으실 정보를 남겨주시면 답변 등록 시 알려드립니다
    </p>
    <div className="mt-2 space-y-2">
      <input
        type="text"
        placeholder="이름 (생략 시 코드명 유지)"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        className="w-full rounded-md border px-2 py-1"
      />
      <input
        type="email"
        placeholder="회신받을 이메일"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        className="w-full rounded-md border px-2 py-1"
      />
      <button
        onClick={handleProfileSubmit}
        className="w-full rounded-md bg-blue-600 py-1.5 font-medium text-white hover:bg-blue-700"
      >
        등록하고 계속 대화하기
      </button>
    </div>
  </div>
)}
```

### 실시간 토픽 이름 갱신 (`editForumTopic`)
방문자가 자신의 실명(예: `홍길동`)과 이메일을 입력하고 "등록"을 누르면, 백엔드는 즉시 Firestore 프로필을 업데이트하는 동시에 Telegram Bot API의 `editForumTopic`을 호출합니다:

```typescript
// src/app/api/contact/profile/route.ts
if (session.telegramTopicId) {
  // 텔레그램 토픽 이름을 실명으로 즉시 변경
  await telegramRequest('editForumTopic', {
    chat_id: TELEGRAM_GROUP_ID,
    message_thread_id: session.telegramTopicId,
    name: `[상담] ${visitorName} (${email || phone || '연락처등록'})`,
  });

  // 해당 토픽에 프로필 갱신 안내 알림
  await telegramRequest('sendMessage', {
    chat_id: TELEGRAM_GROUP_ID,
    message_thread_id: session.telegramTopicId,
    text: `👤 독자 프로필이 업데이트되었습니다.\n- 성함: ${visitorName}\n- 이메일: ${email}\n- 연락처: ${phone}`,
  });
}
```

관리자의 텔레그램 화면에서는 익명 코드명이었던 토픽 제목이 실시간으로 `[상담] 홍길동 (test@example.com)`으로 변경되는 마법 같은 사용자 경험이 완성됩니다.

---

## 4. 실시간 동기화와 발신자 정합성(`initbtn`) 디버깅

양방향 통신을 구현하는 과정에서 반드시 마주치게 되는 치명적인 엣지케이스들이 있었습니다.

### 버그 1: "내가 보낸 메시지가 관리자 답변으로 둔갑하는 현상"
대화창을 새로고침하거나 폴링 주기가 돌 때, 방문자가 자신이 보낸 질문 메시지가 상대방 말풍선("엔지니어")으로 바뀌어 표시되는 버그가 발생했습니다.

* **원인 분석**:
  - 클라이언트의 `messages/route.ts` 폴링 응답 매퍼에서 `item.sender` 값을 검증하지 않고 무조건 `sender: 'admin'`으로 일괄 매핑하고 있었습니다.
  - 텔레그램 웹훅(`telegram-webhook/route.ts`)에서도 봇 자신의 메시지(`message.from?.is_bot === true`)에 대한 예외 처리가 누락되어, 봇이 텔레그램에 전송한 확인 문구가 다시 웹훅으로 들어와 관리자 답변으로 역적재되는 무한 피드백 루프가 돌았습니다.
* **외과적 해결**:
  ```typescript
  // src/app/api/telegram-webhook/route.ts
  // 봇 자신의 메시지는 역적재 방지 필터링
  if (message.from?.is_bot) {
    return NextResponse.json({ ok: true, skipped: 'bot_message' });
  }

  // src/components/FloatingChatBot.tsx
  // sender 필드 엄격 대조
  const mappedMessages = rawMessages.map(m => ({
    id: m.id,
    text: m.text,
    sender: m.sender === 'admin' ? ('admin' as const) : ('user' as const),
    timestamp: m.timestamp,
  }));
  ```

### 레이블 통일: "엔지니어" 대신 "initbtn"
블로그의 브랜딩 아이덴티티를 살리기 위해 범용적인 "엔지니어 답변" 표기를 블로그 작성자의 고유 페르소나인 **"initbtn"**으로 전면 교체하였습니다. 사소해 보이지만 독자에게는 기계적인 자동응답이 아닌 실제 블로그 운영자와 1:1로 소통하고 있다는 신뢰감을 줍니다.

---

## 5. 월 0원 실시간 챗봇 4부작 아키텍처 총정리

4편에 걸쳐 완성된 전체 시스템 아키텍처를 요약하면 다음과 같습니다:

| 구성 요소 | 기술 스택 | 비용 | 담당 역할 |
|---|---|---|---|
| **Frontend** | Next.js 15, Tailwind v4 | $0 (Vercel Hobby) | 플로팅 챗봇 위젯, 코난 코드명 배정, 점진적 온보딩 UX |
| **Backend API** | Next.js Route Handlers | $0 (Vercel Functions) | 토픽 생성, Webhook 라우팅, 쓰로틀링 제어 |
| **Persistence** | Google Cloud Firestore | $0 (Spark Free Tier) | 세션 메타데이터, 대화록 서브컬렉션 영속 저장 |
| **Admin Console**| Telegram Supergroup Topics | $0 (Telegram 무료) | 모바일/데스크톱 1:1 푸시 알림, 토픽별 스레드 상담 콘솔 |
| **Core Gateway** | FastAPI (GCP e2-micro VM) | $0 (GCP Always Free) | RAG 지식 검색, 장기 실행 백그라운드 워커 |

### 핵심 설계 원칙 3가지

1. **제로 시크릿 (Zero Secret)**: 브라우저 번들에는 단 하나의 DB 키나 텔레그램 토큰도 들어가지 않습니다. 모든 인증은 서버리스 백엔드가 캡슐화합니다.
2. **비동기 듀얼 레이어 (Dual Layer)**: 타이핑과 일시적 알림은 RAM에서 가볍게 날리고, 실제 영속이 필요한 대화와 세션 상태만 Firestore에 fire-and-forget으로 적재합니다.
3. **사용자 중심 점진적 설계 (Progressive Frictionless UX)**: 독자에게 먼저 무언가를 요구하지 않습니다. 익명으로 질문을 받되, 가치를 체감한 순간 자연스럽게 연결 통로를 확보합니다.

BaaS(Firebase SDK, Supabase SDK) 라이브러리를 클라이언트에 통째로 싣거나 월 수십 달러의 SaaS 상담 위젯을 구독하지 않아도, 표준 HTTP와 Telegram 생태계를 결합하면 단단하고 세련된 상용 수준의 실시간 챗봇을 **월 0원**으로 운영할 수 있습니다.

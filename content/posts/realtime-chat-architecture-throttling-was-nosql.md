---
title: "실시간 채팅 시스템 설계와 부하 분산의 모든 것: 채널톡의 쓰로틀링 극복기부터 WAS 프록시 NoSQL 아키텍처까지"
slug: "realtime-chat-architecture-throttling-was-nosql"
date: "2026-11-01"
summary: "채팅창의 '...' 타이핑 표시와 수천 개의 동시 대화를 RDBMS에 직접 쓰면 왜 서버가 멈출까? 채널톡(Channel.io)의 대규모 트래픽 분산 사례를 분석하고, GCP 상시 WAS 게이트웨이를 단일 프록시로 삼아 WebSocket·Firebase NoSQL·Supabase RDB·Cloudflare R2를 유기적으로 결합하는 실무 아키텍처를 정리합니다."
tags: ["Architecture", "WebSocket", "NoSQL", "Firebase", "Supabase", "Concurrency", "SystemDesign"]
draft: false
---

## 1. 들어가며: "대화 데이터를 DB에 저장하는 게 일반적인가요?"

실시간 1:1 고객 상담이나 챗봇 시스템을 개발하다 보면 자연스럽게 마주치는 아키텍처 질문이 있습니다:

> *"독자가 글을 입력할 때마다, 혹은 메시지를 보낼 때마다 데이터베이스에 저장하는 게 맞을까? 수천 명이 동시에 채팅을 치면 DB 부하가 너무 심하지 않을까?"*

결론부터 말하자면 **"메시지 본문은 저장하되, '실시간 이벤트'는 DB 근처에도 가지 않게 격리해야 하며, 영구 저장 역시 RDB의 잠금(Lock) 경합을 피하는 전략이 필수적"**입니다.

그렇다면 매일 수억 건의 메시지를 처리하는 **채널톡(Channel.io)** 같은 대규모 B2B 실시간 채팅 SaaS는 이 부하와 쓰로틀링(Throttling) 문제를 어떻게 해결했을까요? 그리고 우리는 **단일 WAS 게이트웨이 원칙(Zero-Trust)**을 지키면서 이 구조를 어떻게 가볍고 우아하게 구현할 수 있을까요?

---

## 2. 채널톡은 어떻게 동시성 한계와 쓰로틀링을 극복했는가?

### (1) 타이핑 인디케이터(`...`)의 비밀: DB 접근 0%
카카오톡이나 슬랙, 채널톡을 보면 상대방이 글을 쓰고 있을 때 **`...` (상대방이 입력 중입니다)** 애니메이션이 실시간으로 뜹니다.

1초에도 수십 번 발생하는 이 타이핑 이벤트는 **극도의 휘발성(Volatile) 데이터**입니다. 
* 만약 이 이벤트를 RDBMS 테이블에 `INSERT/UPDATE`한다면, 몇십 명만 동시에 채팅을 쳐도 DB 트랜잭션 락이 걸리고 커넥션 풀이 1초 만에 고갈됩니다.
* 따라서 채널톡은 타이핑 이벤트를 디스크 DB에 일절 쓰지 않고, **인메모리 Pub/Sub(초기 Redis Pub/Sub ➔ Nats.io)**을 통해 메모리 상에서 상대방 WebSocket으로 즉각 브로드캐스트(Fan-out)하고 1ms 만에 증발시킵니다.

### (2) RDB의 Row-Lock 경합과 쓰로틀링의 실체
초기 서비스들은 흔히 PostgreSQL이나 MySQL 같은 RDBMS에 메시지를 저장합니다. 하지만 동시 접속자가 늘어나면 다음과 같은 병목에 부딪힙니다:
1. **Row-level Lock 경합**: 같은 채팅방에 여러 메시지가 동시에 쏟아지면, ACID 일관성을 유지하기 위해 특정 행이나 인덱스를 잠그면서 대기열(Lock Queue)이 급증합니다.
2. **커넥션 풀(Connection Pool) 고갈**: RDB는 유지할 수 있는 물리적 커넥션 수가 수십~수백 개 수준으로 제한되어 있어 타임아웃이 발생하고, 결국 서버가 새로운 요청을 거절하는 **쓰로틀링(Throttling)** 현상이 발생합니다.

### (3) 채널톡의 해법: NoSQL 파티셔닝(DynamoDB) 도입
채널톡은 이러한 RDB의 쓰로틀링 한계를 극복하기 위해 무제한 수평 확장이 가능한 **NoSQL(Amazon DynamoDB)**을 핵심 저장소로 채택했습니다.
* 채팅방/기업 워크스페이스 단위로 **파티션 키(Partition Key)**를 분할하여 단일 핫스팟 부하를 원천 차단했습니다.
* 쓰기 작업이 기존 레코드를 잠그지 않고 새로운 문서로 추가되는 **Append-Only 구조**로 설계하여 초당 수만 건의 쓰기 요청도 지연 없이 병렬 처리합니다.

---

## 3. 우리의 풀이법: GCP 상시 WAS 게이트웨이 & 4대 인프라 분산

채널톡처럼 거대한 쿠버네티스 클러스터를 띄우지 않더라도, 우리는 이미 구축해 둔 **GCP 상시 WAS 게이트웨이(`marine-edge-pc`)와 4대 인프라 조합**을 통해 완벽한 부하 분산과 제로 트러스트 보안을 달성할 수 있습니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. 클라이언트 계층                              │
│                                                                        │
│       [ 👤 블로그 독자 (UI) ]          [ 🧑‍💻 상담사 대시보드 (/admin) ]       │
│                │                                     │                 │
│   (Zero-Secret / BaaS SDK 없음)          (단일 웹소켓 통신)           │
└────────────────┼─────────────────────────────────────┼─────────────────┘
                 │                                     │
                 ▼                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │  wss://domlog.vercel.app/api/ws (단일 프록시 경로)     │
        └──────────────────────────┬─────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 2. GCP 상시 WAS 게이트웨이 (`marine-edge-pc`)          │
│                                                                        │
│  • 상시 구동 WebSocket Engine (FastAPI / Node.js)                      │
│  • 실시간 세션 맵 & In-Memory 브로커:                                  │
│     - 타이핑 인디케이터(`...`) ➔ DB 미경유, 0ms 즉시 상대방에게 Push    │
│  • 단일 권한 통제소 (모든 BaaS Service Role 키 독점 보유)            │
└───────────────┬──────────────────────┬──────────────────────┬──────────┘
                │ (Admin SDK)          │ (Admin SDK)          │ (S3 SDK)
                ▼                      ▼                      ▼
┌────────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ 3. Firebase (NoSQL)    │  │ 4. Supabase (RDB)  │  │ 5. Cloudflare R2   │
│                        │  │                    │  │                    │
│ • Firestore Documents  │  │ • PostgreSQL 17.11 │  │ • S3 Compatible    │
│ • 대화 세션/채팅 로그  │  │ • 독자 프로필 계정 │  │ • 대화 첨부 미디어 │
│ • Append-Only 무잠금   │  │ • 뉴스레터 구독자  │  │ • Zero-Egress 무료 │
│ • 쓰로틀링 완벽 방어   │  │ • 관리자 인증 정보 │  │ • WAS 스트리밍 중계│
└────────────────────────┘  └────────────────────┘  └────────────────────┘
```

### 왜 Vercel이 아니라 GCP WAS가 웹소켓을 맡아야 하는가?
* **Vercel**: 서버리스 함수(Serverless Function) 환경이므로 요청이 끝나면 프로세스가 잠에 듭니다. 영구적인 TCP 세션인 웹소켓(`wss://`)을 장시간 유지할 수 없습니다.
* **GCP 상시 WAS (`marine-edge-pc`)**: Always Free Tier의 경량 인스턴스에서 상시 기동되는 FastAPI/Node.js 프로세스가 모든 클라이언트의 웹소켓 연결을 한 손에 쥐고 연결 상태를 유지합니다.

---

## 4. 저장소별 최적의 역할 분담 (BaaS의 장점만 취하기)

우리는 브라우저에 어떤 비밀키나 서드파티 SDK도 노출하지 않는 **단일 프록시(Zero-Trust Gateway)** 환경에서 각각의 저장소를 성격에 맞게 분리합니다:

| 저장소 | 담당 영역 | 선택 이유 & 아키텍처적 이점 |
| :--- | :--- | :--- |
| **GCP WAS RAM** | `...` 타이핑 인디케이터 | DB I/O 부하 0%. 메모리 맵에서 양방향 즉각 전달 (< 5ms) |
| **Firebase (Firestore)** | 실시간 대화 세션 로그 (NoSQL) | RDB 락 경합 없는 Append-Only 문서 적재로 **동시성 쓰로틀링 원천 차단** |
| **Supabase (PostgreSQL)** | 독자 프로필, 인증, 구독자 명단 | 정형 비즈니스 데이터의 안전한 트랜잭션(ACID) 및 무결성 보장 |
| **Cloudflare R2** | 채팅 중 첨부되는 이미지/파일 | AWS S3 대비 데이터 다운로드 전송료(Egress Fee)가 $0인 영구 아카이브 |

---

## 5. 실무 구현 코드 예시: GCP WAS의 인메모리 타이핑 브로커

GCP WAS 내부에서 웹소켓으로 들어온 타이핑 이벤트를 DB를 거치지 않고 어떻게 상대방에게 즉시 흘려보내는지의 핵심 로직입니다:

```python
# GCP FastAPI WebSocket Gateway 예시
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, Set

app = FastAPI()

# 활성 웹소켓 커넥션 풀 (메모리 상에서만 관리)
class ConnectionManager:
    def __init__(self):
        # sessionId -> Set[WebSocket]
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_rooms:
            self.active_rooms[session_id] = set()
        self.active_rooms[session_id].add(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_rooms:
            self.active_rooms[session_id].discard(websocket)

    async def broadcast_typing(self, session_id: str, sender: str, is_typing: bool, exclude: WebSocket):
        # 💡 DB에 저장하지 않고, 같은 방에 있는 상대방에게만 즉시 5ms 이내 전송
        if session_id in self.active_rooms:
            payload = {"type": "typing", "sender": sender, "isTyping": is_typing}
            for conn in self.active_rooms[session_id]:
                if conn != exclude:
                    await conn.send_json(payload)

manager = ConnectionManager()

@app.websocket("/ws/chat/{session_id}")
async def chat_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "typing":
                # 타이핑 상태는 DB를 건드리지 않고 브로드캐스트만 수행
                await manager.broadcast_typing(
                    session_id, data.get("sender"), data.get("isTyping"), exclude=websocket
                )
            elif event_type == "message":
                # 실제 대화 메시지만 비동기로 Firebase Firestore에 저장!
                await save_to_firebase_async(session_id, data.get("text"))
                # 상대방에게 메시지 전달
                await manager.broadcast_message(session_id, data)
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
```

---

## 6. 마치며: 단순함이 최고의 확장성이다

실시간 기능을 만든다고 해서 무조건 고가의 전용 챗봇 SaaS를 도입하거나, 반대로 모든 패킷을 무작정 관계형 DB에 쑤셔 넣을 필요는 없습니다.

1. **휘발성 이벤트(타이핑, 접속 상태)**는 인메모리(RAM / Pub-Sub)에서만 놀게 하고,
2. **동시성 쓰기가 잦은 채팅 로그**는 분산 NoSQL(Firebase/DynamoDB)의 Append-Only로 잠금을 없애며,
3. **핵심 마스터 데이터**만 안정적인 RDB(Supabase PostgreSQL)에 담는 것.

그리고 이 모든 연결의 중심에 **단 하나의 보안 WAS 게이트웨이**를 세워두는 것이, 보안(Zero-Trust)과 성능(Zero-Throttling)을 동시에 잡는 가장 견고한 현대적 실시간 시스템 아키텍처입니다.

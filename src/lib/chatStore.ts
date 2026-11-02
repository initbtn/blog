// src/lib/chatStore.ts
import { getGatewayClient } from './gatewayClient';

/**
 * Hybrid In-Memory + Assist WAS Gateway Chat Relay Store
 *
 * - Hot Path (응답 지연 0ms 수렴): 인메모리 Map으로 타이핑 및 빠른 메시지 폴링 처리 (게이트웨이 호출 0회)
 * - Cold Path (비동기 영속화): 메시지 발생 시 assist 게이트웨이로 비동기 전송 (Firestore 접근은 게이트웨이만 한다)
 * - 게이트웨이 환경변수가 없으면 인메모리로만 동작한다
 */

export interface RelayMessage {
  id: string;
  sessionId: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: number;
  timeString: string;
}

export interface SessionInfo {
  sessionId: string;
  senderName: string;
  contact: string;
  createdAt: number;
  lastActiveAt: number;
  status: 'idle' | 'seen' | 'typing';
  lastTypingAt?: number;
  unreadAdminCount: number;
  telegramTopicId?: number;
  messages: RelayMessage[];
}

declare global {
  var __blogChatStore: Map<string, SessionInfo> | undefined;
}

const store: Map<string, SessionInfo> = global.__blogChatStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global.__blogChatStore = store;
}

/**
 * 게이트웨이 비동기 저장 헬퍼 (사용자 응답 경로를 블로킹하지 않음)
 * 클라이언트는 던지지 않으므로 실패는 로그로만 남는다.
 */
async function persistSessionAndMessageAsync(session: SessionInfo, message: RelayMessage) {
  const client = getGatewayClient();
  if (!client) return;

  const upserted = await client.upsertSession({
    sessionId: session.sessionId,
    senderName: session.senderName,
    contact: session.contact,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
    unreadAdminCount: session.unreadAdminCount,
    telegramTopicId: session.telegramTopicId,
  });
  if (!upserted) return;

  await client.appendMessage(session.sessionId, {
    id: message.id,
    sender: message.sender,
    text: message.text,
    timestamp: message.timestamp,
    timeString: message.timeString,
  });
}

export function registerUserMessage(
  sessionId: string,
  text: string,
  senderName: string = '방문자',
  contact: string = '미제공',
  telegramTopicId?: number
): RelayMessage {
  const cleanId = sessionId.trim();
  const now = Date.now();
  const timeString = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  if (!store.has(cleanId)) {
    store.set(cleanId, {
      sessionId: cleanId,
      senderName,
      contact,
      createdAt: now,
      lastActiveAt: now,
      status: 'idle',
      unreadAdminCount: 0,
      messages: [],
    });
  }

  const session = store.get(cleanId)!;
  session.senderName = senderName || session.senderName;
  session.contact = contact || session.contact;
  session.telegramTopicId = telegramTopicId ?? session.telegramTopicId;
  session.lastActiveAt = now;
  session.unreadAdminCount += 1;

  const msg: RelayMessage = {
    id: `msg-${now}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId: cleanId,
    sender: 'user',
    text,
    timestamp: now,
    timeString,
  };

  session.messages.push(msg);

  // 게이트웨이 비동기 영속화 (fire-and-forget)
  persistSessionAndMessageAsync(session, msg).catch(() => {});

  return msg;
}

export function addAdminMessage(sessionId: string, text: string): RelayMessage {
  const cleanId = sessionId.trim();
  const now = Date.now();
  const timeString = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  if (!store.has(cleanId)) {
    store.set(cleanId, {
      sessionId: cleanId,
      senderName: '방문자',
      contact: '미제공',
      createdAt: now,
      lastActiveAt: now,
      status: 'idle',
      unreadAdminCount: 0,
      messages: [],
    });
  }

  const session = store.get(cleanId)!;
  session.lastActiveAt = now;
  session.status = 'idle'; // 답변 전송 완료 시 typing 해제
  session.lastTypingAt = undefined;

  const msg: RelayMessage = {
    id: `msg-${now}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId: cleanId,
    sender: 'admin',
    text,
    timestamp: now,
    timeString,
  };

  session.messages.push(msg);

  // 게이트웨이 비동기 영속화 (fire-and-forget)
  persistSessionAndMessageAsync(session, msg).catch(() => {});

  return msg;
}

/**
 * 상담사가 클라이언트 앱에서 답변을 입력 중일 때 호출 (순수 인메모리 - DB 쓰기 0회)
 */
export function setAdminTyping(sessionId: string, isTyping: boolean) {
  const cleanId = sessionId.trim();
  if (store.has(cleanId)) {
    const session = store.get(cleanId)!;
    session.status = isTyping ? 'typing' : 'idle';
    session.lastTypingAt = isTyping ? Date.now() : undefined;
  }
}

/**
 * 텔레그램 포럼 토픽 ID 로 세션 조회 (토픽 수는 적어 선형 탐색으로 충분하고, 별도 인덱스의 stale 위험이 없다)
 */
export function getSessionByTopicId(topicId: number): SessionInfo | undefined {
  for (const session of store.values()) {
    if (session.telegramTopicId === topicId) return session;
  }
  return undefined;
}

/**
 * 세션 ID 로 단건 조회
 */
export function getSessionById(sessionId: string): SessionInfo | undefined {
  return store.get(sessionId.trim());
}

/**
 * 모든 세션 목록 조회 (관리자 대시보드용)
 */
export function getAllSessions(): SessionInfo[] {
  const sessions = Array.from(store.values());
  return sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}

/**
 * 게이트웨이로부터 세션 복원 또는 최신화 (서버리스 Cold Start 대비)
 * 메모리에 이미 있는 세션은 건드리지 않는다.
 */
export async function syncSessionsFromGateway(): Promise<SessionInfo[]> {
  const client = getGatewayClient();
  if (!client) return getAllSessions();

  const metas = await client.listSessions(50);
  if (!metas) return getAllSessions();

  for (const meta of metas) {
    if (store.has(meta.sessionId)) continue;

    const detail = await client.getSession(meta.sessionId);
    if (!detail) continue;

    const messages: RelayMessage[] = detail.messages.map((m) => ({
      id: m.id,
      sessionId: meta.sessionId,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
      timeString: m.timeString,
    }));

    store.set(meta.sessionId, {
      sessionId: meta.sessionId,
      senderName: meta.senderName || '방문자',
      contact: meta.contact || '미제공',
      createdAt: meta.createdAt || Date.now(),
      lastActiveAt: meta.lastActiveAt || Date.now(),
      status: 'idle',
      unreadAdminCount: meta.unreadAdminCount || 0,
      telegramTopicId: meta.telegramTopicId,
      messages,
    });
  }

  return getAllSessions();
}

/**
 * 특정 세션의 메시지 및 상태 조회 (독자 polling용)
 */
export function getMessagesSince(sessionId: string, sinceTimestamp: number = 0): {
  messages: RelayMessage[];
  status: 'idle' | 'seen' | 'typing';
} {
  const cleanId = sessionId.trim();
  if (!store.has(cleanId)) {
    return { messages: [], status: 'idle' };
  }

  const session = store.get(cleanId)!;

  // 상담사가 입력을 멈춘 지 6초가 지나면 자동으로 typing 상태 해제
  if (session.status === 'typing' && session.lastTypingAt && Date.now() - session.lastTypingAt > 6000) {
    session.status = 'idle';
  }

  const newMsgs = session.messages.filter((m) => m.timestamp > sinceTimestamp);
  return {
    messages: newMsgs,
    status: session.status,
  };
}

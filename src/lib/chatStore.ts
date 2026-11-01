// src/lib/chatStore.ts
/**
 * In-Memory & Serverless Safe Session Chat Relay Store
 * 
 * - 실시간 세션 목록 관리
 * - 상담사 키 입력 이벤트 기반 실시간 typing 감지
 * - 독자-관리자 양방향 릴레이
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
  messages: RelayMessage[];
}

declare global {
  var __blogChatStore: Map<string, SessionInfo> | undefined;
}

const store: Map<string, SessionInfo> = global.__blogChatStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global.__blogChatStore = store;
}

export function registerUserMessage(
  sessionId: string,
  text: string,
  senderName: string = '방문자',
  contact: string = '미제공'
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
  return msg;
}

/**
 * 상담사가 클라이언트 앱에서 답변을 입력 중일 때 호출
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
 * 모든 세션 목록 조회 (관리자 대시보드용)
 */
export function getAllSessions(): SessionInfo[] {
  const sessions = Array.from(store.values());
  return sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
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

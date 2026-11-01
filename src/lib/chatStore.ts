// src/lib/chatStore.ts
import { getFirestore, FIRESTORE_COLLECTIONS } from './firestore';

/**
 * Hybrid In-Memory + Cloud Firestore Chat Relay Store
 * 
 * - Hot Path (응답 지연 0ms 수렴): 인메모리 Map을 통해 독자 ↔ 상담사 간 실시간 타이핑 및 빠른 메시지 폴링 처리
 * - Cold Path (비동기 영속화): 메시지 발생 시 백그라운드로 Firestore에 비동기 저장하여 서버리스 컨테이너 재기동 후에도 데이터 보존
 * - Migration Ready: 전용 컬렉션 'domlog_chat_sessions' 및 서브컬렉션 'messages' 구조로 향후 독립 DB 이전 지원
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

/**
 * Firestore 비동기 저장 헬퍼 (사용자 응답 경로를 블로킹하지 않음)
 */
async function persistSessionAndMessageAsync(session: SessionInfo, message: RelayMessage) {
  try {
    const firestore = getFirestore();
    if (!firestore) return;

    const sessionRef = firestore.collection(FIRESTORE_COLLECTIONS.SESSIONS).doc(session.sessionId);

    // 세션 메타데이터 Upsert
    await sessionRef.set(
      {
        sessionId: session.sessionId,
        senderName: session.senderName,
        contact: session.contact,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        unreadAdminCount: session.unreadAdminCount,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    // 메시지 서브컬렉션 문서 저장
    await sessionRef.collection(FIRESTORE_COLLECTIONS.MESSAGES).doc(message.id).set({
      id: message.id,
      sessionId: message.sessionId,
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp,
      timeString: message.timeString,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error(`[Firestore Persistence Error] session=${session.sessionId} msg=${message.id}:`, err);
  }
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

  // Firestore 비동기 영속화 (fire-and-forget)
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

  // Firestore 비동기 영속화 (fire-and-forget)
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
 * 모든 세션 목록 조회 (관리자 대시보드용)
 */
export function getAllSessions(): SessionInfo[] {
  const sessions = Array.from(store.values());
  return sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}

/**
 * Firestore로부터 세션 복원 또는 최신화 (서버리스 Cold Start 대비)
 */
export async function syncSessionsFromFirestore(): Promise<SessionInfo[]> {
  try {
    const firestore = getFirestore();
    if (!firestore) return getAllSessions();

    const snapshot = await firestore
      .collection(FIRESTORE_COLLECTIONS.SESSIONS)
      .orderBy('lastActiveAt', 'desc')
      .limit(50)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const sId = data.sessionId;
      if (!store.has(sId)) {
        // 메시지 서브컬렉션 복원
        const msgSnapshot = await doc.ref
          .collection(FIRESTORE_COLLECTIONS.MESSAGES)
          .orderBy('timestamp', 'asc')
          .get();

        const messages: RelayMessage[] = msgSnapshot.docs.map((mDoc) => {
          const m = mDoc.data();
          return {
            id: m.id,
            sessionId: sId,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
            timeString: m.timeString,
          };
        });

        store.set(sId, {
          sessionId: sId,
          senderName: data.senderName || '방문자',
          contact: data.contact || '미제공',
          createdAt: data.createdAt || Date.now(),
          lastActiveAt: data.lastActiveAt || Date.now(),
          status: 'idle',
          unreadAdminCount: data.unreadAdminCount || 0,
          messages,
        });
      }
    }
  } catch (err) {
    console.warn('[Firestore Sync Warning] Failed to sync sessions from Firestore:', err);
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

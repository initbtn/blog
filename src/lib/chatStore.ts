// src/lib/chatStore.ts
/**
 * In-Memory & Serverless Safe Session Chat Relay Store
 * 
 * 텔레그램 관리자의 Reply 웹훅을 수신하여 해당 sessionId에 메시지를 적재하고,
 * 프론트엔드가 이를 폴링/가져갈 수 있도록 보관합니다.
 */

export interface RelayMessage {
  id: string;
  sessionId: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: number;
  timeString: string;
}

interface SessionState {
  status: 'idle' | 'seen' | 'typing';
  lastSeenTime?: number;
  messages: RelayMessage[];
}

// Global cache for warm serverless instances
declare global {
  var __blogChatStore: Map<string, SessionState> | undefined;
}

const store: Map<string, SessionState> = global.__blogChatStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global.__blogChatStore = store;
}

export function getSessionState(sessionId: string): SessionState {
  const cleanId = sessionId.trim();
  if (!store.has(cleanId)) {
    store.set(cleanId, {
      status: 'idle',
      messages: [],
    });
  }
  return store.get(cleanId)!;
}

export function setSessionStatus(sessionId: string, status: 'idle' | 'seen' | 'typing') {
  const state = getSessionState(sessionId);
  state.status = status;
  if (status === 'seen' || status === 'typing') {
    state.lastSeenTime = Date.now();
  }
}

export function addRelayMessage(sessionId: string, sender: 'admin' | 'user', text: string): RelayMessage {
  const state = getSessionState(sessionId);
  const now = new Date();
  const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const msg: RelayMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId,
    sender,
    text,
    timestamp: Date.now(),
    timeString,
  };

  state.messages.push(msg);
  // 관리자가 답장을 보내면 typing 상태 해제
  if (sender === 'admin') {
    state.status = 'idle';
  }
  return msg;
}

export function getMessagesSince(sessionId: string, sinceTimestamp: number = 0): {
  messages: RelayMessage[];
  status: 'idle' | 'seen' | 'typing';
} {
  const state = getSessionState(sessionId);
  // Auto-expire 'typing' status after 12 seconds if no reply sent
  if (state.status === 'typing' && state.lastSeenTime && Date.now() - state.lastSeenTime > 12000) {
    state.status = 'idle';
  }

  const newMsgs = state.messages.filter((m) => m.timestamp > sinceTimestamp);
  return {
    messages: newMsgs,
    status: state.status,
  };
}

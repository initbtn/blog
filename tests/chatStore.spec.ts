import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerUserMessage,
  addAdminMessage,
  setAdminTyping,
  getAllSessions,
  getMessagesSince,
  syncSessionsFromFirestore,
} from '../src/lib/chatStore';

// Firestore mock
vi.mock('../src/lib/firestore', () => {
  const mockDoc = {
    set: vi.fn().mockResolvedValue({}),
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        set: vi.fn().mockResolvedValue({}),
      }),
      orderBy: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ docs: [] }),
    }),
  };

  const mockCollection = {
    doc: vi.fn().mockReturnValue(mockDoc),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({
      docs: [
        {
          data: () => ({
            sessionId: 'restored-session-1',
            senderName: '복원독자',
            contact: 'test@example.com',
            createdAt: 1000,
            lastActiveAt: 2000,
            unreadAdminCount: 1,
          }),
          ref: {
            collection: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnThis(),
              get: vi.fn().mockResolvedValue({
                docs: [
                  {
                    data: () => ({
                      id: 'msg-restored-1',
                      sessionId: 'restored-session-1',
                      sender: 'user',
                      text: '이전 대화 내용입니다.',
                      timestamp: 1500,
                      timeString: '오전 10:00',
                    }),
                  },
                ],
              }),
            }),
          },
        },
      ],
    }),
  };

  const mockFirestore = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };

  return {
    getFirestore: vi.fn().mockReturnValue(mockFirestore),
    FIRESTORE_COLLECTIONS: {
      SESSIONS: 'domlog_chat_sessions',
      MESSAGES: 'messages',
    },
  };
});

describe('Hybrid In-Memory + Firestore Chat Relay Store', () => {
  const sessionId = 'test-session-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('독자 메시지 등록 시 인메모리에 저장되고 세션 정보가 갱신되어야 한다', () => {
    const msg = registerUserMessage(sessionId, '안녕하세요 문의드립니다.', '홍길동', '010-0000-0000');

    expect(msg).toBeDefined();
    expect(msg.sessionId).toBe(sessionId);
    expect(msg.text).toBe('안녕하세요 문의드립니다.');
    expect(msg.sender).toBe('user');

    const sessions = getAllSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);
    expect(session).toBeDefined();
    expect(session?.senderName).toBe('홍길동');
    expect(session?.contact).toBe('010-0000-0000');
    expect(session?.messages.length).toBeGreaterThan(0);
  });

  it('상담사 답변 등록 시 세션에 추가되고 typing 상태가 해제되어야 한다', () => {
    setAdminTyping(sessionId, true);
    let { status } = getMessagesSince(sessionId, 0);
    expect(status).toBe('typing');

    const adminMsg = addAdminMessage(sessionId, '답변드립니다!');
    expect(adminMsg.sender).toBe('admin');
    expect(adminMsg.text).toBe('답변드립니다!');

    const updated = getMessagesSince(sessionId, 0);
    expect(updated.status).toBe('idle');
  });

  it('타이핑 상태는 6초가 경과하면 자동으로 idle로 복귀해야 한다', () => {
    setAdminTyping(sessionId, true);
    const sessions = getAllSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      session.lastTypingAt = Date.now() - 7000; // 7초 전으로 조작
    }

    const { status } = getMessagesSince(sessionId, 0);
    expect(status).toBe('idle');
  });

  it('syncSessionsFromFirestore 호출 시 Firestore의 세션 및 서브컬렉션 메시지가 인메모리로 복원되어야 한다', async () => {
    const sessions = await syncSessionsFromFirestore();
    const restored = sessions.find((s) => s.sessionId === 'restored-session-1');

    expect(restored).toBeDefined();
    expect(restored?.senderName).toBe('복원독자');
    expect(restored?.messages.length).toBe(1);
    expect(restored?.messages[0].text).toBe('이전 대화 내용입니다.');
  });
});

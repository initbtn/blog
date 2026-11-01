import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerUserMessage,
  addAdminMessage,
  setAdminTyping,
  getAllSessions,
  getMessagesSince,
  syncSessionsFromGateway,
} from '../src/lib/chatStore';

const URL_BASE = 'https://gw.example.test';
const TOKEN = 'ast_live_SECRETTOKEN123';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// 영속화는 fire-and-forget 이라 응답 이후에 일어난다.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Hybrid In-Memory + Assist Gateway Chat Relay Store', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('ASSIST_GATEWAY_URL', URL_BASE);
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', TOKEN);
    fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('독자 메시지 등록 시 인메모리에 저장되고 세션 정보가 갱신되어야 한다', () => {
    const sessionId = 'mem-session-1';
    const msg = registerUserMessage(sessionId, '안녕하세요 문의드립니다.', '홍길동', '010-0000-0000');

    expect(msg.sessionId).toBe(sessionId);
    expect(msg.text).toBe('안녕하세요 문의드립니다.');
    expect(msg.sender).toBe('user');

    const session = getAllSessions().find((s) => s.sessionId === sessionId);
    expect(session?.senderName).toBe('홍길동');
    expect(session?.contact).toBe('010-0000-0000');
    expect(session?.messages.length).toBe(1);
  });

  it('독자 메시지 등록 시 게이트웨이로 세션 upsert 후 메시지 append 가 나간다', async () => {
    const msg = registerUserMessage('gw-session-1', '게이트웨이로 가야 함', '이름', '연락처');
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [first, second] = fetchMock.mock.calls;
    expect(first[0]).toBe(`${URL_BASE}/v1/gateway/chat/sessions`);
    expect(JSON.parse(first[1].body).sessionId).toBe('gw-session-1');
    expect(second[0]).toBe(`${URL_BASE}/v1/gateway/chat/sessions/gw-session-1/messages`);
    expect(JSON.parse(second[1].body)).toEqual({
      id: msg.id,
      sender: 'user',
      text: '게이트웨이로 가야 함',
      timestamp: msg.timestamp,
      timeString: msg.timeString,
    });
    expect(first[1].headers['Authorization']).toBe(`Bearer ${TOKEN}`);
  });

  it('상담사 답변 등록 시에도 메시지가 게이트웨이로 append 된다', async () => {
    const msg = addAdminMessage('gw-session-2', '답변드립니다!');
    await flush();

    const paths = fetchMock.mock.calls.map((c) => c[0]);
    expect(paths).toContain(`${URL_BASE}/v1/gateway/chat/sessions/gw-session-2/messages`);
    const appended = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/messages'));
    expect(JSON.parse(appended![1].body).id).toBe(msg.id);
    expect(JSON.parse(appended![1].body).sender).toBe('admin');
  });

  it('상담사 답변 등록 시 typing 상태가 해제되어야 한다', () => {
    const sessionId = 'typing-session-1';
    registerUserMessage(sessionId, '문의');
    setAdminTyping(sessionId, true);
    expect(getMessagesSince(sessionId, 0).status).toBe('typing');

    addAdminMessage(sessionId, '답변');
    expect(getMessagesSince(sessionId, 0).status).toBe('idle');
  });

  it('타이핑 이벤트는 게이트웨이 호출을 만들지 않는다', async () => {
    const sessionId = 'typing-session-2';
    registerUserMessage(sessionId, '문의');
    await flush();
    fetchMock.mockClear();

    setAdminTyping(sessionId, true);
    setAdminTyping(sessionId, true);
    setAdminTyping(sessionId, false);
    getMessagesSince(sessionId, 0);
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('타이핑 상태는 6초가 경과하면 자동으로 idle로 복귀해야 한다', () => {
    const sessionId = 'typing-session-3';
    registerUserMessage(sessionId, '문의');
    setAdminTyping(sessionId, true);
    const session = getAllSessions().find((s) => s.sessionId === sessionId)!;
    session.lastTypingAt = Date.now() - 7000;

    expect(getMessagesSince(sessionId, 0).status).toBe('idle');
  });

  it('게이트웨이 환경변수가 없으면 호출 없이 인메모리로만 동작한다', async () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');

    const msg = registerUserMessage('local-session-1', '로컬 전용');
    addAdminMessage('local-session-1', '로컬 답변');
    await flush();

    expect(msg.text).toBe('로컬 전용');
    expect(fetchMock).not.toHaveBeenCalled();
    const session = getAllSessions().find((s) => s.sessionId === 'local-session-1');
    expect(session?.messages.length).toBe(2);
  });

  it('게이트웨이가 실패해도 등록은 동기적으로 정상 반환되고 처리되지 않은 거부가 없다', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    const msg = registerUserMessage('fail-session-1', '실패해도 응답은 와야 함');
    await flush();
    await flush();
    process.off('unhandledRejection', unhandled);

    expect(msg.text).toBe('실패해도 응답은 와야 함');
    expect(unhandled).not.toHaveBeenCalled();
    const session = getAllSessions().find((s) => s.sessionId === 'fail-session-1');
    expect(session?.messages.length).toBe(1);
  });

  it('syncSessionsFromGateway 는 목록과 상세를 조회해 메모리에 없는 세션을 복원한다', async () => {
    const meta = {
      sessionId: 'restored-session-1',
      senderName: '복원독자',
      contact: 'test@example.com',
      createdAt: 1000,
      lastActiveAt: 2000,
      unreadAdminCount: 1,
    };
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/v1/gateway/chat/sessions?limit=50')) {
        return jsonResponse(200, { sessions: [meta] });
      }
      if (url.endsWith('/v1/gateway/chat/sessions/restored-session-1')) {
        return jsonResponse(200, {
          session: meta,
          messages: [
            { id: 'msg-restored-1', sender: 'user', text: '이전 대화 내용입니다.', timestamp: 1500, timeString: '오전 10:00' },
          ],
        });
      }
      return jsonResponse(404, { error: { code: 'not_found', message: '' } });
    });

    const sessions = await syncSessionsFromGateway();
    const restored = sessions.find((s) => s.sessionId === 'restored-session-1');

    expect(restored?.senderName).toBe('복원독자');
    expect(restored?.status).toBe('idle');
    expect(restored?.messages.length).toBe(1);
    expect(restored?.messages[0]).toEqual({
      id: 'msg-restored-1',
      sessionId: 'restored-session-1',
      sender: 'user',
      text: '이전 대화 내용입니다.',
      timestamp: 1500,
      timeString: '오전 10:00',
    });
  });

  it('이미 메모리에 있는 세션은 복원 시 덮어쓰거나 상세를 다시 조회하지 않는다', async () => {
    const sessionId = 'live-session-1';
    registerUserMessage(sessionId, '살아있는 최신 메시지');
    await flush();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('?limit=')) {
        return jsonResponse(200, {
          sessions: [{ sessionId, senderName: '옛값', contact: '옛', createdAt: 1, lastActiveAt: 1, unreadAdminCount: 0 }],
        });
      }
      return jsonResponse(404, { error: { code: 'not_found', message: '' } });
    });

    await syncSessionsFromGateway();

    const detailCalls = fetchMock.mock.calls.filter((c) => String(c[0]).endsWith(`/${sessionId}`));
    expect(detailCalls.length).toBe(0);
    const session = getAllSessions().find((s) => s.sessionId === sessionId);
    expect(session?.messages[0].text).toBe('살아있는 최신 메시지');
    expect(session?.senderName).not.toBe('옛값');
  });

  it('복원 시 게이트웨이가 실패하면 현재 메모리 상태를 그대로 돌려준다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, { error: { code: 'internal', message: '' } }));
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const sessions = await syncSessionsFromGateway();

    expect(Array.isArray(sessions)).toBe(true);
  });

  it('복원 시 환경변수가 없으면 호출 없이 현재 메모리 상태를 돌려준다', async () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');

    const sessions = await syncSessionsFromGateway();

    expect(Array.isArray(sessions)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

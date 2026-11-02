import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as contactPOST } from '@/app/api/contact/route';
import { POST as webhookPOST } from '@/app/api/telegram-webhook/route';
import {
  getSessionByTopicId,
  getMessagesSince,
  getAllSessions,
} from '@/lib/chatStore';

const GROUP_ID = '-1004450175161';
let nextTopic = 100;

function jsonReq(url: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function tgOk(result: unknown): Response {
  return new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getAllTopic(sessionId: string): number {
  return getAllSessions().find((s) => s.sessionId === sessionId)!.telegramTopicId!;
}

describe('POST /api/contact — 세션별 포럼 토픽', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'bot-token');
    vi.stubEnv('TELEGRAM_CHAT_ID', GROUP_ID);
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');
    fetchMock = vi.fn(async (url: string) =>
      String(url).endsWith('/createForumTopic') ? tgOk({ message_thread_id: 77 }) : tgOk({})
    );
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('새 세션이면 토픽을 만들고 그 토픽으로 메시지를 보낸다', async () => {
    await contactPOST(jsonReq('/api/contact', { name: '홍길동', message: '안녕', sessionId: 'abc123' }));

    const [createUrl, createInit] = fetchMock.mock.calls[0];
    expect(String(createUrl)).toContain('/createForumTopic');
    const createBody = JSON.parse(createInit.body);
    expect(createBody.chat_id).toBe(GROUP_ID);
    expect(createBody.name).toBe('[방문자] 홍길동 (#sess-abc123)');

    const [sendUrl, sendInit] = fetchMock.mock.calls[1];
    expect(String(sendUrl)).toContain('/sendMessage');
    expect(JSON.parse(sendInit.body).message_thread_id).toBe(77);
    expect(getSessionByTopicId(77)?.sessionId).toBe('abc123');
  });

  it('같은 세션의 두 번째 문의는 토픽을 새로 만들지 않고 기존 토픽에 보낸다', async () => {
    await contactPOST(jsonReq('/api/contact', { name: 'B', message: '1', sessionId: 'dup1' }));
    fetchMock.mockClear();
    await contactPOST(jsonReq('/api/contact', { name: 'B', message: '2', sessionId: 'dup1' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/sendMessage');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).message_thread_id).toBe(77);
  });

  it('토픽 생성이 실패해도 메인 그룹으로 메시지는 전달한다', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).endsWith('/createForumTopic')
        ? new Response('{"ok":false}', { status: 400 })
        : tgOk({})
    );
    const res = await contactPOST(jsonReq('/api/contact', { name: 'C', message: 'x', sessionId: 'fail1' }));

    expect((await res.json()).success).toBe(true);
    const sendCall = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/sendMessage'))!;
    expect(JSON.parse(sendCall[1].body).message_thread_id).toBeUndefined();
  });
});

describe('POST /api/telegram-webhook — 토픽 기반 릴레이', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'bot-token');
    vi.stubEnv('TELEGRAM_CHAT_ID', GROUP_ID);
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');
    vi.stubGlobal('fetch', vi.fn(async () => tgOk({ message_thread_id: nextTopic++ })));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('토픽 안에 Reply 없이 입력한 텍스트가 해당 세션의 관리자 메시지가 된다', async () => {
    await contactPOST(jsonReq('/api/contact', { name: 'D', message: '문의', sessionId: 'relay1' }));
    const topicId = getAllTopic('relay1');

    const res = await webhookPOST(
      jsonReq('/api/telegram-webhook', { message: { message_thread_id: topicId, text: '답변입니다' } })
    );
    expect((await res.json()).deliveredTo).toBe('relay1');
    const admin = getMessagesSince('relay1', 0).messages.filter((m) => m.sender === 'admin');
    expect(admin.map((m) => m.text)).toEqual(['답변입니다']);
  });

  it('알 수 없는 토픽의 메시지는 무시한다', async () => {
    const res = await webhookPOST(
      jsonReq('/api/telegram-webhook', { message: { message_thread_id: 31337, text: '누구?' } })
    );
    expect((await res.json()).deliveredTo).toBeUndefined();
  });

  it('토픽 안의 /typing 은 타이핑 상태만 켠다', async () => {
    await contactPOST(jsonReq('/api/contact', { name: 'E', message: '문의', sessionId: 'typ1' }));
    await webhookPOST(jsonReq('/api/telegram-webhook', { message: { message_thread_id: getAllTopic('typ1'), text: '/typing' } }));
    expect(getMessagesSince('typ1', 0).status).toBe('typing');
  });
});

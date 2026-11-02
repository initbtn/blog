import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CONAN_CODENAMES, getRandomCodename } from '../src/lib/codenames';
import {
  registerUserMessage,
  updateSessionProfile,
  getSessionById,
  getAllSessions,
  getMessagesSince,
  addAdminMessage,
} from '../src/lib/chatStore';

const URL_BASE = 'https://gw.example.test';
const TOKEN = 'ast_live_SECRETTOKEN123';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Conan Codenames & Progressive Profile Onboarding', () => {
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

  it('코난 코드명 풀은 럼, 진, 워커 등 10개 이상의 명칭을 포함해야 한다', () => {
    expect(CONAN_CODENAMES.length).toBeGreaterThanOrEqual(10);
    expect(CONAN_CODENAMES).toContain('럼');
    expect(CONAN_CODENAMES).toContain('진');
    expect(CONAN_CODENAMES).toContain('워커');
    expect(CONAN_CODENAMES).toContain('버본');

    const randomName = getRandomCodename();
    expect(CONAN_CODENAMES).toContain(randomName);
  });

  it('세션 초기 등록 시 코난 코드명으로 생성되어야 한다', () => {
    const sessionId = 'conan-sess-1';
    const codename = '럼';
    registerUserMessage(sessionId, '첫 질의 메시지입니다', codename, '미제공', 101);

    const session = getSessionById(sessionId);
    expect(session).toBeDefined();
    expect(session?.senderName).toBe('럼');
    expect(session?.contact).toBe('미제공');
    expect(session?.telegramTopicId).toBe(101);
  });

  it('1차 질의 후 성함/연락처 입력 시 updateSessionProfile로 갱신되어야 한다', async () => {
    const sessionId = 'conan-sess-2';
    registerUserMessage(sessionId, '문의합니다', '진', '미제공', 102);
    await flush();

    const updated = updateSessionProfile(sessionId, '홍길동', 'hong@test.com');
    expect(updated).toBeDefined();
    expect(updated?.senderName).toBe('홍길동');
    expect(updated?.contact).toBe('hong@test.com');
    expect(updated?.telegramTopicId).toBe(102);

    const reloaded = getSessionById(sessionId);
    expect(reloaded?.senderName).toBe('홍길동');
    expect(reloaded?.contact).toBe('hong@test.com');
  });

  it('getMessagesSince는 user 메시지와 admin 메시지를 각각의 sender로 유지해야 한다', () => {
    const sessionId = 'sender-integrity-sess';
    registerUserMessage(sessionId, '방문자 메시지');
    addAdminMessage(sessionId, 'initbtn의 답변입니다');

    const result = getMessagesSince(sessionId, 0);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].sender).toBe('user');
    expect(result.messages[0].text).toBe('방문자 메시지');
    expect(result.messages[1].sender).toBe('admin');
    expect(result.messages[1].text).toBe('initbtn의 답변입니다');
  });

  it('POST /api/contact/profile 요청 시 세션 프로필 및 텔레그램 토픽이 갱신된다', async () => {
    const { POST: profilePost } = await import('../src/app/api/contact/profile/route');
    const sessionId = 'profile-route-sess';
    registerUserMessage(sessionId, '초기 메시지', '버본', '미제공', 777);

    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test_token');
    vi.stubEnv('TELEGRAM_CHAT_ID', '-100123456');

    const req = new Request('http://localhost/api/contact/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        name: '남도일',
        contact: 'kudo@test.com',
      }),
    });

    const res = await profilePost(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.senderName).toBe('남도일');
    expect(body.contact).toBe('kudo@test.com');

    // editForumTopic 호출 검증
    const editTopicCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/editForumTopic'));
    expect(editTopicCall).toBeDefined();
    expect(JSON.parse(editTopicCall![1].body).name).toContain('남도일');
  });

  it('텔레그램 웹훅 2-b는 봇(is_bot: true)의 메시지를 관리자 답장으로 등록하지 않는다', async () => {
    const { POST: webhookPost } = await import('../src/app/api/telegram-webhook/route');
    const sessionId = 'webhook-bot-sess';
    registerUserMessage(sessionId, '질문입니다', '워커', '미제공');

    const req = new Request('http://localhost/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          message_id: 999,
          from: { is_bot: true, first_name: 'SomeBot' },
          text: '봇의 자동 발송 메시지',
          reply_to_message: {
            text: `문의 접수 #sess-${sessionId}`,
          },
        },
      }),
    });

    const res = await webhookPost(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    // deliveredTo가 없어야 함 (무시됨)
    expect(body.deliveredTo).toBeUndefined();

    const result = getMessagesSince(sessionId, 0);
    expect(result.messages.filter((m) => m.sender === 'admin').length).toBe(0);
  });
});

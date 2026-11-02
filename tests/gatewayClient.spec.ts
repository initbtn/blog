import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGatewayClient } from '../src/lib/gatewayClient';

const URL_BASE = 'https://gw.example.test';
const TOKEN = 'ast_live_SECRETTOKEN123';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const meta = {
  sessionId: 's-1',
  senderName: '홍길동',
  contact: '010-0000-0000',
  createdAt: 1000,
  lastActiveAt: 2000,
  unreadAdminCount: 1,
};

const message = {
  id: 'msg-1',
  sender: 'user' as const,
  text: '안녕하세요',
  timestamp: 1500,
  timeString: '오전 10:00',
};

describe('getGatewayClient 설정', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('URL·토큰이 모두 있으면 클라이언트를 돌려준다', () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', URL_BASE);
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', TOKEN);
    expect(getGatewayClient()).not.toBeNull();
  });

  it('둘 다 없으면 null', () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');
    expect(getGatewayClient()).toBeNull();
  });

  it('URL 만 있으면 null (일부만 맞는 값)', () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', URL_BASE);
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '');
    expect(getGatewayClient()).toBeNull();
  });

  it('토큰만 있으면 null (일부만 맞는 값)', () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', '');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', TOKEN);
    expect(getGatewayClient()).toBeNull();
  });

  it('공백뿐인 값은 설정되지 않은 것으로 본다 (헷갈리는 값)', () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', '   ');
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', '  ');
    expect(getGatewayClient()).toBeNull();
  });
});

describe('GatewayClient 계약', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('ASSIST_GATEWAY_URL', URL_BASE);
    vi.stubEnv('ASSIST_GATEWAY_TOKEN', TOKEN);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('upsertSession: POST /v1/gateway/chat/sessions + Bearer 헤더 + 본문', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    const ok = await getGatewayClient()!.upsertSession(meta);

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/v1/gateway/chat/sessions`);
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe(`Bearer ${TOKEN}`);
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual(meta);
  });

  it('appendMessage: POST .../sessions/{id}/messages, 201 과 멱등 200 모두 성공', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { ok: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = getGatewayClient()!;

    expect(await client.appendMessage('s-1', message)).toBe(true);
    expect(await client.appendMessage('s-1', message)).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/v1/gateway/chat/sessions/s-1/messages`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(message);
  });

  it('sessionId 는 경로에서 인코딩된다 (슬래시가 경로를 깨지 않는다)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { ok: true }));

    await getGatewayClient()!.appendMessage('a/b c', message);

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${URL_BASE}/v1/gateway/chat/sessions/a%2Fb%20c/messages`
    );
  });

  it('URL 끝 슬래시는 정규화된다 (맞지만 헷갈리는 값)', async () => {
    vi.stubEnv('ASSIST_GATEWAY_URL', `${URL_BASE}/`);
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await getGatewayClient()!.upsertSession(meta);

    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_BASE}/v1/gateway/chat/sessions`);
  });

  it('getSession: 200 이면 세션 메타와 메시지를 돌려준다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { session: meta, messages: [{ ...message }] })
    );

    const result = await getGatewayClient()!.getSession('s-1');

    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_BASE}/v1/gateway/chat/sessions/s-1`);
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
    expect(result?.session).toEqual(meta);
    expect(result?.messages).toEqual([message]);
  });

  it('getSession: 404 이면 null', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(404, { error: { code: 'not_found', message: 'x' } })
    );

    expect(await getGatewayClient()!.getSession('nope')).toBeNull();
  });

  it('listSessions: limit 쿼리를 붙이고 세션 배열을 돌려준다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { sessions: [meta] }));

    const result = await getGatewayClient()!.listSessions(50);

    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_BASE}/v1/gateway/chat/sessions?limit=50`);
    expect(result).toEqual([meta]);
  });

  it('401 은 실패로 처리되어 false/null 이고 던지지 않는다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { error: { code: 'unauthorized', message: 'bad token' } })
    );
    const client = getGatewayClient()!;

    await expect(client.upsertSession(meta)).resolves.toBe(false);
    await expect(client.listSessions(50)).resolves.toBeNull();
  });

  it('5xx 도 실패로 처리되어 던지지 않는다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(500, { error: { code: 'internal', message: 'boom' } })
    );

    await expect(getGatewayClient()!.appendMessage('s-1', message)).resolves.toBe(false);
  });

  it('네트워크 오류도 던지지 않고, 로그에 토큰·URL 이 찍히지 않는다', async () => {
    fetchMock.mockRejectedValue(new TypeError(`fetch failed ${URL_BASE} ${TOKEN}`));

    const ok = await getGatewayClient()!.upsertSession(meta);

    expect(ok).toBe(false);
    const logged = JSON.stringify([...errorSpy.mock.calls, ...warnSpy.mock.calls]);
    expect(logged.length).toBeGreaterThan(2); // 로그는 남는다
    expect(logged).not.toContain(TOKEN);
    expect(logged).not.toContain('gw.example.test');
  });

  it('실패 응답 본문에 토큰이 에코돼도 로그에 찍히지 않는다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { error: { code: 'bad', message: `echo ${TOKEN}` } })
    );

    await getGatewayClient()!.upsertSession(meta);

    const logged = JSON.stringify([...errorSpy.mock.calls, ...warnSpy.mock.calls]);
    expect(logged).not.toContain(TOKEN);
  });

  it('3초 안에 응답이 없으면 abort 되어 false', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );

    const pending = getGatewayClient()!.upsertSession(meta);
    await vi.advanceTimersByTimeAsync(2999);
    let settled = false;
    pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toBe(false);
  });
});

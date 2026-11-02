// src/lib/gatewayClient.ts
//
// assist WAS 게이트웨이 클라이언트. 서비스 계정 키 없이 Bearer 토큰만으로 호출한다.
// 모든 메서드는 던지지 않는다 — 실패는 false/null 로 돌려주고 로그만 남긴다.

export interface GatewaySessionMeta {
  sessionId: string;
  senderName: string;
  contact: string;
  createdAt: number;
  lastActiveAt: number;
  unreadAdminCount: number;
}

export interface GatewayMessage {
  id: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: number;
  timeString: string;
}

export interface GatewaySessionDetail {
  session: GatewaySessionMeta;
  messages: GatewayMessage[];
}

const REQUEST_TIMEOUT_MS = 3000;
const SESSIONS_PATH = '/v1/gateway/chat/sessions';

class GatewayClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  upsertSession(meta: GatewaySessionMeta): Promise<boolean> {
    return this.write('POST', SESSIONS_PATH, meta);
  }

  appendMessage(sessionId: string, message: GatewayMessage): Promise<boolean> {
    return this.write(
      'POST',
      `${SESSIONS_PATH}/${encodeURIComponent(sessionId)}/messages`,
      message
    );
  }

  async getSession(sessionId: string): Promise<GatewaySessionDetail | null> {
    return this.read<GatewaySessionDetail>(
      `${SESSIONS_PATH}/${encodeURIComponent(sessionId)}`
    );
  }

  async listSessions(limit: number): Promise<GatewaySessionMeta[] | null> {
    const body = await this.read<{ sessions: GatewaySessionMeta[] }>(
      `${SESSIONS_PATH}?limit=${limit}`
    );
    return body ? body.sessions : null;
  }

  private async write(method: 'POST', path: string, payload: unknown): Promise<boolean> {
    const res = await this.request(method, path, payload);
    return res !== null;
  }

  private async read<T>(path: string): Promise<T | null> {
    const res = await this.request('GET', path);
    if (!res) return null;
    try {
      return (await res.json()) as T;
    } catch {
      console.warn(`[Gateway] GET ${path} 응답 본문을 해석하지 못했습니다.`);
      return null;
    }
  }

  // 로그에는 메서드·경로·상태코드·오류 종류만 남긴다.
  // 오류 메시지·응답 본문에 URL 이나 토큰이 섞일 수 있어 그대로 찍지 않는다.
  private async request(method: 'GET' | 'POST', path: string, payload?: unknown): Promise<Response | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.warn(`[Gateway] ${method} ${path} 실패: status=${res.status}`);
        return null;
      }
      return res;
    } catch (err) {
      const kind = err instanceof Error ? err.name : 'UnknownError';
      console.error(`[Gateway] ${method} ${path} 요청 오류: ${kind}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

export type { GatewayClient };

/**
 * 환경변수가 모두 있을 때만 클라이언트를 돌려준다. 하나라도 없으면 null —
 * 호출 쪽은 null 이면 영속화를 건너뛰고 인메모리로만 동작한다.
 * 매 호출마다 읽어 런타임에 주입된 값을 따른다.
 */
export function getGatewayClient(): GatewayClient | null {
  const url = process.env.ASSIST_GATEWAY_URL?.trim();
  const token = process.env.ASSIST_GATEWAY_TOKEN?.trim();
  if (!url || !token) return null;
  return new GatewayClient(url.replace(/\/+$/, ''), token);
}

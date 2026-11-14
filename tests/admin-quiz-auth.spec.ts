import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/admin/quiz/route';

describe('Admin Quiz API - Auth & Boundary Tests (Tier 1 TDD)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createMockJwt(email: string) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ email, sub: 'user_123', aud: 'test_project' })).toString('base64');
    const signature = 'mock_signature_part_that_makes_the_token_length_sufficiently_long_for_validation_check_test_1234567890';
    return `${header}.${payload}.${signature}`;
  }

  it('401 반환: Authorization 헤더가 누락된 경우', async () => {
    const req = new NextRequest('http://localhost/api/admin/quiz');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('403 반환: 환경변수(ADMIN_EMAILS)가 설정되지 않은 경우 (기본 차단)', async () => {
    delete process.env.ADMIN_EMAILS;
    delete process.env.ADMIN_ALLOWED_EMAILS;

    const token = createMockJwt('admin@test.com');
    const req = new NextRequest('http://localhost/api/admin/quiz', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401); // verifyAdminToken returns false -> 401 Unauthorized
  });

  it('401/403 반환: 화이트리스트에 없는 비관리자 이메일 접근 시', async () => {
    process.env.ADMIN_EMAILS = 'cto.jsconn@gmail.com,dev.js.conn@gmail.com';

    const token = createMockJwt('attacker@malicious.com');
    const req = new NextRequest('http://localhost/api/admin/quiz', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('401 반환: 화이트리스트 이메일을 부분 포함하는 조작된 이메일 차단 (경계값)', async () => {
    process.env.ADMIN_EMAILS = 'cto.jsconn@gmail.com,dev.js.conn@gmail.com';

    // cto.jsconn@gmail.com.fake.com 같은 부분 일치 공격
    const token = createMockJwt('cto.jsconn@gmail.com.fake.com');
    const req = new NextRequest('http://localhost/api/admin/quiz', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await GET(req);
    // 현재 구현은 includes()를 쓰므로 이 테스트가 실패(RED)해야 정상!
    expect(res.status).toBe(401);
  });

  it('200 승인: 화이트리스트에 정확히 일치하는 관리자 이메일 접근 시', async () => {
    process.env.ADMIN_EMAILS = 'cto.jsconn@gmail.com,dev.js.conn@gmail.com';

    const token = createMockJwt('cto.jsconn@gmail.com');
    const req = new NextRequest('http://localhost/api/admin/quiz', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.questions)).toBe(true);
  });
});

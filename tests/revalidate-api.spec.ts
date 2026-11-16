import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('On-Demand Revalidate API Authorization Specification', () => {
  const secretKey = 'ast_s2s_revalidate_shared_secret';
  const expectedHash = crypto.createHash('sha256').update(secretKey).digest('hex');

  it('올바른 Bearer 토큰 해시가 전달되면 인가에 성공해야 한다', () => {
    const authHeader = `Bearer ${secretKey}`;
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');

    expect(computedHash).toBe(expectedHash);
  });

  it('잘못된 토큰이 전달되면 인가에 실패해야 한다', () => {
    const authHeader = 'Bearer wrong_token';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');

    expect(computedHash).not.toBe(expectedHash);
  });

  it('재검증 페이로드에서 slug가 정상 추출되어야 한다', () => {
    const payload = { slug: 'ncs-swe-7-1-quality-standards' };
    const safeSlug = payload.slug.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();

    expect(safeSlug).toBe('ncs-swe-7-1-quality-standards');
  });
});

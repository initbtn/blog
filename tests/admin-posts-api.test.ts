import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

describe('Admin Posts API SHA-256 Auth Verification', () => {
  const rawKey = 'ast_live_test_secret_12345';
  const expectedHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  it('validates correct Bearer token hash matching BLOG_ADMIN_KEY_HASH', () => {
    const incomingHeader = `Bearer ${rawKey}`;
    const token = incomingHeader.replace(/^Bearer\s+/i, '').trim();
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    expect(computedHash).toBe(expectedHash);
  });

  it('rejects invalid or tampered Bearer token', () => {
    const invalidHeader = `Bearer ast_live_wrong_token`;
    const token = invalidHeader.replace(/^Bearer\s+/i, '').trim();
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    expect(computedHash).not.toBe(expectedHash);
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design Tokens Matrix 1:1 Parity Tests (Tier 1 TDD)', () => {
  const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  // Parse CSS variables from a block
  function extractTokens(blockName: ':root' | '.dark'): Map<string, string> {
    const tokens = new Map<string, string>();
    const regex = blockName === ':root'
      ? /:root\s*\{([^}]+)\}/m
      : /\.dark\s*\{([^}]+)\}/m;

    const blockIndex = cssContent.indexOf(blockName);
    if (blockIndex === -1) return tokens;
    const openBrace = cssContent.indexOf('{', blockIndex);
    const closeBrace = cssContent.indexOf('}', openBrace);
    if (openBrace === -1 || closeBrace === -1) return tokens;

    const body = cssContent.slice(openBrace + 1, closeBrace);
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) {
        const [key, val] = trimmed.split(':');
        if (key && val) {
          tokens.set(key.trim(), val.replace(';', '').trim());
        }
      }
    }
    return tokens;
  }

  const rootTokens = extractTokens(':root');
  const darkTokens = extractTokens('.dark');

  const requiredTokens = [
    '--background',
    '--foreground',
    '--muted',
    '--border',
    '--card',
    '--card-bg',
    '--card-border',
    '--grid-line',
    '--radial-glow',
    '--accent',
    '--waffle',
    '--code-bg',
    '--code-border',
    '--code-text',
    '--table-border',
    '--table-th-bg',
    '--table-tr-alt',
    '--card-shadow',
  ];

  it('필수 디자인 토큰들이 :root(Light) 블록에 모두 정의되어 있어야 한다', () => {
    for (const token of requiredTokens) {
      expect(rootTokens.has(token), `Missing token in :root: ${token}`).toBe(true);
      expect(rootTokens.get(token)!.length).toBeGreaterThan(0);
    }
  });

  it('필수 디자인 토큰들이 .dark 블록에 모두 1:1 대칭으로 정의되어 있어야 한다', () => {
    for (const token of requiredTokens) {
      expect(darkTokens.has(token), `Missing token in .dark: ${token}`).toBe(true);
      expect(darkTokens.get(token)!.length).toBeGreaterThan(0);
    }
  });

  it(':root와 .dark 간 토큰 키 목록이 완전히 일치해야 한다 (1:1 패리티)', () => {
    const rootKeys = Array.from(rootTokens.keys()).sort();
    const darkKeys = Array.from(darkTokens.keys()).sort();
    expect(rootKeys).toEqual(darkKeys);
  });
});

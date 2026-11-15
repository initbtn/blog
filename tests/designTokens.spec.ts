import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design Tokens Dual-Theme Compliance', () => {
  const targetFiles = [
    'src/app/posts/[slug]/page.tsx',
    'src/components/TopicFrequencyBadge.tsx',
    'src/components/HeaderActions.tsx',
    'src/components/Header.tsx',
    'src/components/PostCard.tsx',
    'src/components/RelatedPosts.tsx',
    'src/app/page.tsx',
    'src/app/about/page.tsx',
  ];

  it('주요 사용자 대면 컴포넌트에 dark: 없는 text-white가 하드코딩되지 않아야 한다', () => {
    const violations: string[] = [];

    for (const relativePath of targetFiles) {
      const fullPath = path.resolve(process.cwd(), relativePath);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // text-white 단독 검사 (dark:text-white는 허용)
        if (/\btext-white\b/.test(line) && !/dark:text-white/.test(line)) {
          // 예외: selection:text-white 등 접두사 있는 경우 제외
          if (!/selection:text-white/.test(line)) {
            violations.push(`${relativePath}:${index + 1} -> ${line.trim()}`);
          }
        }
      });
    }

    expect(violations, `하드코딩된 text-white 발견:\n${violations.join('\n')}`).toEqual([]);
  });

  it('TopicFrequencyBadge 내 모든 뱃지 카운트 및 퍼센트 텍스트는 라이트 모드 가독성을 위한 듀얼 토큰을 가져야 한다', () => {
    const fullPath = path.resolve(process.cwd(), 'src/components/TopicFrequencyBadge.tsx');
    const content = fs.readFileSync(fullPath, 'utf-8');

    // 라이트 모드에서 안 보이는 하드코딩된 slate-200/300/400 텍스트 및 bg-slate-800이 dark: 없이 단독으로 쓰이면 위반
    const lines = content.split('\n');
    const violations: string[] = [];

    lines.forEach((line, idx) => {
      if (/\b(text-slate-[234]00|bg-slate-800\/80)\b/.test(line) && !/dark:/.test(line)) {
        violations.push(`L${idx + 1}: ${line.trim()}`);
      }
    });

    expect(violations, `TopicFrequencyBadge 내 다크 전용 클래스 잔여 발견:\n${violations.join('\n')}`).toEqual([]);
  });

  it('HeaderActions 내 공유하기 버튼은 라이트 모드 대칭 토큰을 포함해야 한다', () => {
    const fullPath = path.resolve(process.cwd(), 'src/components/HeaderActions.tsx');
    const content = fs.readFileSync(fullPath, 'utf-8');

    // handleShare 버튼이 라이트모드 스타일을 갖추고 있는지 검증
    expect(content).toContain('dark:bg-slate-800');
    expect(content).toContain('dark:text-slate-200');
  });

  it('RelatedPosts 컴포넌트는 h4 제목에 라이트모드 slate-900 및 다크모드 slate-100 대칭 토큰을 사용해야 한다', () => {
    const fullPath = path.resolve(process.cwd(), 'src/components/RelatedPosts.tsx');
    const content = fs.readFileSync(fullPath, 'utf-8');

    expect(content).toContain('text-slate-900 dark:text-slate-100');
    expect(content).not.toMatch(/h4[^>]*text-slate-200\b(?!.*dark:)/);
  });

  it('Home page 프로젝트 카드는 다크 전용 text-slate-200 단독 사용 없이 듀얼 토큰을 사용해야 한다', () => {
    const fullPath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(fullPath, 'utf-8');

    expect(content).toContain('text-slate-900 dark:text-slate-100');
    expect(content).not.toMatch(/font-bold\s+text-slate-200\b(?!.*dark:)/);
  });
});

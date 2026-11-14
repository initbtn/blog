import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { TopicFrequencyBadge } from '@/components/TopicFrequencyBadge';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('UI Components Dual-Theme Rendering Tests (Tier 1)', () => {
  it('TopicFrequencyBadge: GRADE A+ 슬러그 렌더링 시 라이트/다크 듀얼 토큰 클래스를 포함해야 한다', () => {
    // 1-1은 GRADE A+ (66 Qs, 15.5%)
    const { container } = render(<TopicFrequencyBadge slug="ncs-swe-1-1-traditional-sdlc-waterfall-spiral-up" />);
    const badge = container.querySelector('span');

    expect(badge).not.toBeNull();
    const className = badge?.className || '';

    // 라이트 모드 가독성 색상과 다크 모드 색상이 공존하는지 검증
    expect(className).toContain('text-rose-600');
    expect(className).toContain('dark:text-rose-300');
    expect(className).toContain('bg-rose-500/10');
  });

  it('TopicFrequencyBadge: GRADE B 슬러그 렌더링 시 라이트/다크 듀얼 토큰 클래스를 포함해야 한다', () => {
    // 6-1은 GRADE B (30 Qs, 7.0%)
    const { container } = render(<TopicFrequencyBadge slug="ncs-swe-6-1-software-configuration-maintenance" />);
    const badge = container.querySelector('span');

    expect(badge).not.toBeNull();
    const className = badge?.className || '';

    expect(className).toContain('text-sky-700');
    expect(className).toContain('dark:text-sky-300');
  });

  it('TopicFrequencyBadge: GRADE D 슬러그 렌더링 시 라이트 모드 회색 배경(bg-slate-100)을 제공해야 한다', () => {
    // 3-2는 GRADE D (3 Qs, 0.7%)
    const { container } = render(<TopicFrequencyBadge slug="ncs-swe-3-2-solid-design-principles-code-refactoring" />);
    const badge = container.querySelector('span');

    expect(badge).not.toBeNull();
    const className = badge?.className || '';

    expect(className).toContain('bg-slate-100');
    expect(className).toContain('dark:bg-slate-800/80');
    expect(className).toContain('text-slate-700');
    expect(className).toContain('dark:text-slate-300');
  });

  it('ThemeToggle: 테마 토글 버튼이 렌더링되고 접근성 aria-label 및 테마 전환 클래스를 갖추어야 한다', () => {
    const { container } = render(<ThemeToggle />);
    const button = container.querySelector('button');

    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-label')).toMatch(/(라이트|다크) 모드로 전환/);
    expect(button?.className).toContain('border-slate-300');
    expect(button?.className).toContain('dark:border-slate-700/60');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import AdminQuizDashboard from '@/app/admin/quiz/page';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: (auth: any, callback: any) => {
    callback(null); // 비로그인 상태 시뮬레이션
    return () => {};
  },
}));

describe('Admin Quiz Dashboard Theme Tokens', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('비로그인 카드 제목이 다크 전용(text-slate-100)이 아닌 듀얼 토큰(text-slate-900 dark:text-slate-100)을 갖는다', () => {
    render(<AdminQuizDashboard />);
    const heading = screen.getByRole('heading', { name: /관리자 실전 기출 학습실/i });
    expect(heading.className).toContain('text-slate-900');
    expect(heading.className).toContain('dark:text-slate-100');
  });

  it('로그인 버튼이 듀얼 테마 호버 및 대비 토큰을 갖는다', () => {
    render(<AdminQuizDashboard />);
    const button = screen.getByRole('button', { name: /Google 계정으로 로그인/i });
    expect(button.className).toContain('bg-slate-900');
    expect(button.className).toContain('dark:bg-white');
  });
});

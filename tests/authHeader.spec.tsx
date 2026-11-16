import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import * as authHook from '@/hooks/useAuth';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

// Mock useAuth
vi.mock('@/hooks/useAuth');
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Global Auth UI & Navigation Integration', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('비로그인 상태: Header에 로그인 버튼이 노출되고 기출 학습실 링크는 보이지 않는다', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      isAdmin: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    const loginButton = screen.getByRole('button', { name: /Google 로그인/i });
    expect(loginButton).toBeDefined();

    // 기출 학습실 링크는 비로그인 시 노출되지 않음
    expect(screen.queryByText('학습실')).toBeNull();
  });

  it('관리자 로그인 상태: Header에 사용자 아바타와 학습실(/admin/quiz) 진입로가 노출된다', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: {
        uid: 'admin-123',
        email: 'initbtn@gmail.com',
        displayName: '도미닉',
        photoURL: 'https://example.com/avatar.png',
      } as any,
      loading: false,
      isAdmin: true,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByRole('link', { name: /학습실/i })).toBeDefined();
    expect(screen.getByAltText(/관리자 프로필/i)).toBeDefined();
  });

  it('관리자 로그인 상태: MobileBottomNav 에 학습실(/admin/quiz) 탭이 동적으로 추가된다', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: {
        uid: 'admin-123',
        email: 'initbtn@gmail.com',
        displayName: '도미닉',
        photoURL: 'https://example.com/avatar.png',
      } as any,
      loading: false,
      isAdmin: true,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<MobileBottomNav />);
    expect(screen.getByRole('link', { name: /학습실/i })).toBeDefined();
  });
});

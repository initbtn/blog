import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import AdminQuizDashboard from '@/app/admin/quiz/page';
import { TopicQuizCardDeck } from '@/components/TopicQuizCardDeck';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

const mockUser = {
  uid: 'test-admin-uid',
  email: 'initbtn@gmail.com',
  displayName: 'Dominic Kim',
  photoURL: 'https://example.com/photo.jpg',
  getIdToken: vi.fn().mockResolvedValue('mock-firebase-id-token'),
};

let authStateCallback: any = null;

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: (auth: any, callback: any) => {
    authStateCallback = callback;
    callback(mockUser);
    return () => {};
  },
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => false,
    data: () => ({}),
  }),
  setDoc: vi.fn().mockResolvedValue(undefined),
}));

// Mock useAuth for TopicQuizCardDeck
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    isAdmin: true,
    idToken: 'mock-firebase-id-token',
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockQuestions = [
  {
    id: 'Q1',
    source: '정보처리기사',
    ncs_module: 'M1',
    chapter: '소프트웨어 설계',
    subtopic_id: '1-1',
    question: '소프트웨어 생명주기 모델 중 폭포수 모델의 특징은?',
    choices: [
      { number: 1, text: '순차적 접근', is_correct: true },
      { number: 2, text: '반복적 프로토타이핑', is_correct: false },
    ],
    answer: 1,
    explain: '폭포수 모델은 고전적 순차 모델입니다.',
  },
  {
    id: 'Q2',
    source: '공무원 7급',
    ncs_module: 'M4',
    chapter: '소프트웨어 개발',
    subtopic_id: '4-1',
    question: '화이트박스 테스트 검증 기준 중 분기 커버리지란?',
    choices: [
      { number: 1, text: '모든 문장 1회 실행', is_correct: false },
      { number: 2, text: '결정 포인트의 참/거짓 분기 실행', is_correct: true },
    ],
    answer: 2,
    explain: '분기 커버리지는 각 조건문의 참과 거짓이 최소 한 번씩 실행되도록 합니다.',
  },
  {
    id: 'Q3',
    source: '정보처리기사',
    ncs_module: 'M4',
    chapter: '소프트웨어 개발',
    subtopic_id: '4-2',
    question: '순환 복잡도(Cyclomatic Complexity) 계산식으로 올바른 것은?',
    choices: [
      { number: 1, text: 'E - N + 2P', is_correct: true },
      { number: 2, text: 'E + N - 2P', is_correct: false },
    ],
    answer: 1,
    explain: '순환 복잡도 V(G) = E - N + 2P 입니다.',
  },
];

describe('Quiz Taxonomy & Filtering', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/quiz')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            subject: '소프트웨어공학',
            total: mockQuestions.length,
            questions: mockQuestions,
          }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
  });

  describe('TopicQuizCardDeck Google Auth Integration', () => {
    it('useAuth의 idToken을 헤더에 실어 문제를 정상 요청하고 렌더링한다', async () => {
      render(<TopicQuizCardDeck moduleCode="M1" subTopicCode="1-1" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/quiz?module=M1'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-firebase-id-token',
            }),
          })
        );
      });

      // Q1 문제가 노출되는지 확인
      expect(await screen.findByText(/소프트웨어 생명주기 모델 중 폭포수 모델의 특징은/i)).toBeDefined();
    });
  });

  describe('AdminQuizDashboard Filtering', () => {
    it('기출고사(출처)별 필터 선택 시 해당 출처 문제만 필터링되어 카운트와 문제가 갱신된다', async () => {
      render(<AdminQuizDashboard />);

      // 문제 로딩 대기 (초기 전체 3문항)
      expect(await screen.findByText(/1 \/ 3/i)).toBeDefined();

      // 기출고사 필터 셀렉터 확인
      const sourceSelect = screen.getByRole('combobox', { name: /기출고사별 필터|출처 필터/i });
      expect(sourceSelect).toBeDefined();

      // '공무원 7급' 선택
      fireEvent.change(sourceSelect, { target: { value: '공무원 7급' } });

      // 총 1문항으로 필터링되어야 함
      expect(await screen.findByText(/1 \/ 1/i)).toBeDefined();
      expect(screen.getByText(/화이트박스 테스트 검증 기준 중 분기 커버리지란/i)).toBeDefined();
    });

    it('NCS 모듈별 필터 선택 시 해당 모듈 문제만 필터링된다', async () => {
      render(<AdminQuizDashboard />);

      expect(await screen.findByText(/1 \/ 3/i)).toBeDefined();

      // 모듈 필터 셀렉터 확인
      const moduleSelect = screen.getByRole('combobox', { name: /토픽별 필터|모듈 필터/i });
      expect(moduleSelect).toBeDefined();

      // 'M4' 선택 (2문항)
      fireEvent.change(moduleSelect, { target: { value: 'M4' } });

      expect(await screen.findByText(/1 \/ 2/i)).toBeDefined();
    });
  });
});

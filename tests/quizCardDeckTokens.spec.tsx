import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { FormattedQuestion } from '@/components/FormattedQuestion';
import { TopicQuizCardDeck } from '@/components/TopicQuizCardDeck';

// Mock Firebase & useAuth
vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'initbtn@gmail.com' },
    loading: false,
    isAdmin: true,
    idToken: 'mock-token',
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockQuestion = {
  id: 'M1-1',
  source: '정보처리기사',
  exam_title: '2022년 1회',
  ncs_module: 'M1',
  chapter: '소프트웨어 설계',
  subtopic_id: '1-1',
  question: '소프트웨어 생명주기 모델에 관한 설명이다.\n\n○ 폭포수 모델은 순차적 접근을 강조한다.',
  choices: [
    { number: 1, text: '순차적 모델', is_correct: true },
    { number: 2, text: '나선형 모델', is_correct: false },
  ],
  answer: 1,
  explain: '폭포수 모델의 해설입니다.',
};

describe('Quiz Deck Design Tokens (Light/Dark 1:1 Parity)', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('FormattedQuestion tokens', () => {
    it('기본 질문 텍스트에 라이트/다크 듀얼 토큰(text-slate-900 dark:text-slate-100)을 갖는다', () => {
      const { container } = render(<FormattedQuestion questionIndex={1} rawText="소프트웨어 생명주기 모델의 특징은?" />);
      const stemDiv = container.querySelector('div');
      expect(stemDiv?.className).toContain('text-slate-900');
      expect(stemDiv?.className).toContain('dark:text-slate-100');
    });

    it('보기(Bullets) 상자에 라이트/다크 듀얼 토큰(bg-slate-100 dark:bg-slate-900, border-slate-200 dark:border-slate-800)을 갖는다', () => {
      const { container } = render(
        <FormattedQuestion
          questionIndex={1}
          rawText={'다음을 만족하는 모델은?\n\n○ 요구사항 정의\n○ 설계 및 구현'}
        />
      );
      const box = container.querySelector('.rounded-xl');
      expect(box?.className).toContain('border-slate-200');
      expect(box?.className).toContain('dark:border-slate-800');
      expect(box?.className).toContain('dark:bg-slate-900');
    });
  });

  describe('TopicQuizCardDeck tokens', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          questions: [mockQuestion],
        }),
      });
    });

    it('카드덱 외곽 컨테이너와 보기 버튼에 듀얼 테마 토큰을 갖는다', async () => {
      const { container } = render(<TopicQuizCardDeck moduleCode="M1" subTopicCode="1-1" />);

      await waitFor(() => {
        expect(screen.getByText(/순차적 모델/i)).toBeDefined();
      });

      // 외곽 섹션
      const section = container.querySelector('section');
      expect(section?.className).toContain('border-slate-200');
      expect(section?.className).toContain('dark:border-slate-800');

      // 선택 보기 버튼 기본 스타일
      const choiceButton = screen.getByRole('button', { name: /1 순차적 모델/i });
      expect(choiceButton.className).toContain('border-slate-200');
      expect(choiceButton.className).toContain('dark:border-slate-800');
      expect(choiceButton.className).toContain('text-slate-800');
      expect(choiceButton.className).toContain('dark:text-slate-200');
    });

    it('정답을 선택하기 전 힌트 토글 시 힌트가 노출되고, 정답 선택 후에는 해설 섹션으로 대체된다', async () => {
      render(<TopicQuizCardDeck moduleCode="M1" subTopicCode="1-1" />);

      await waitFor(() => {
        expect(screen.getByText(/순차적 모델/i)).toBeDefined();
      });

      // 힌트 켜기 버튼 클릭
      const hintButton = screen.getByTitle(/힌트 켜기/i);
      hintButton.click();

      // 힌트 박스 노출 확인
      expect(await screen.findByText(/핵심 개념 힌트/i)).toBeDefined();

      // 1번 선지(정답) 선택
      const choiceButton = screen.getByRole('button', { name: /1 순차적 모델/i });
      choiceButton.click();

      // 정답 상태 확인
      expect(await screen.findByText(/정답 \(정답: 1번\)/i)).toBeDefined();

      // 힌트 박스는 해설로 대체되어 렌더링되지 않아야 함
      expect(screen.queryByText(/핵심 개념 힌트/i)).toBeNull();
    });
  });
});

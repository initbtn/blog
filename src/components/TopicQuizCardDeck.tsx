'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Star,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { FormattedQuestion } from './FormattedQuestion';

export interface Choice {
  number: number;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string;
  source: string;
  exam_title: string;
  ncs_module: string;
  ncs_title?: string;
  question: string;
  choices: Choice[];
  answer: number;
  explain?: string;
}

interface TopicQuizCardDeckProps {
  moduleCode: string; // e.g. "M1", "M2"
  moduleTitle?: string;
}

const STORAGE_KEY = 'ncs_scrapped_questions_v1';
const HINT_PREF_KEY = 'ncs_global_hint_enabled_v1';

export function TopicQuizCardDeck({ moduleCode, moduleTitle }: TopicQuizCardDeckProps) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [globalHintEnabled, setGlobalHintEnabled] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'scrapped'>('all');
  const [scrappedIds, setScrappedIds] = useState<string[]>([]);

  // Touch Swipe Gesture State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // 1. Load preferences from localStorage
  useEffect(() => {
    try {
      const savedScrap = localStorage.getItem(STORAGE_KEY);
      if (savedScrap) {
        setScrappedIds(JSON.parse(savedScrap));
      }
      const savedHint = localStorage.getItem(HINT_PREF_KEY);
      if (savedHint !== null) {
        setGlobalHintEnabled(JSON.parse(savedHint));
      }
    } catch (e) {
      console.error('Failed to load preferences from storage', e);
    }
  }, []);

  // 2. Fetch questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/data/ncs_questions.json');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data: Question[] = await res.json();
        const filtered = data.filter((q) => q.ncs_module === moduleCode);
        setAllQuestions(filtered);
      } catch (err) {
        console.error('Failed to load topic questions', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [moduleCode]);

  // Active question list according to filter mode
  const activeQuestions = useMemo(() => {
    if (filterMode === 'scrapped') {
      return allQuestions.filter((q) => scrappedIds.includes(q.id));
    }
    return allQuestions;
  }, [allQuestions, filterMode, scrappedIds]);

  // Adjust currentIndex when questions change
  useEffect(() => {
    if (currentIndex >= activeQuestions.length && activeQuestions.length > 0) {
      setCurrentIndex(activeQuestions.length - 1);
    }
    setSelectedChoice(null);
    setShowExplanation(false);
  }, [filterMode, activeQuestions.length]);

  // Save scrapped IDs
  const toggleScrap = (id: string) => {
    setScrappedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save scrap', e);
      }
      return updated;
    });
  };

  // Toggle global hint preference
  const toggleGlobalHint = () => {
    setGlobalHintEnabled((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem(HINT_PREF_KEY, JSON.stringify(nextVal));
      } catch (e) {
        console.error('Failed to save hint preference', e);
      }
      return nextVal;
    });
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  };

  // Desktop Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeQuestions.length]);

  // Mobile Touch Swipe Handlers (Min distance: 50px)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Go Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Go Prev
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleSelectChoice = (choiceNum: number) => {
    setSelectedChoice(choiceNum);
    setShowExplanation(true);

    const currentQ = activeQuestions[currentIndex];
    if (currentQ && choiceNum !== currentQ.answer && !scrappedIds.includes(currentQ.id)) {
      toggleScrap(currentQ.id);
    }
  };

  const handleReset = () => {
    setSelectedChoice(null);
    setShowExplanation(false);
  };

  // Generate question hint safely without spoiling the answer
  const getQuestionHint = (q: Question) => {
    const qText = q.question.toLowerCase();
    if (qText.includes('나선형') || qText.includes('spiral')) {
      return '나선형(Spiral) 모델의 4대 핵심 활동 중 가장 차별화되는 단계는 위험 분석(Risk Analysis)입니다. 대규모 고위험 프로젝트에 적용됩니다.';
    }
    if (qText.includes('폭포수') || qText.includes('waterfall')) {
      return '폭포수 모델은 순차적·하향식이며 각 단계의 명확한 산출물 승인이 필수적입니다. 요구사항 변경 수용이 어렵습니다.';
    }
    if (qText.includes('스크럼') || qText.includes('scrum')) {
      return '스크럼에서 리뷰(Review)는 제품 시연 및 피드백, 회고(Retrospective)는 팀의 일하는 방식 및 프로세스 개선에 초점을 둡니다.';
    }
    if (qText.includes('xp') || qText.includes('익스트림')) {
      return 'XP의 12대 실천 프랙티스(TDD, Pair Programming, Continuous Integration, Refactoring 등)와 5대 가치(용기, 단순성, 의사소통, 피드백, 존중)를 대조해보세요.';
    }
    if (qText.includes('애자일') || qText.includes('agile')) {
      return '애자일 4대 선언문: 공정/도구보다는 개인과 상호작용, 포괄적 문서보다는 동작하는 소프트웨어, 계약 협상보다는 고객과의 협력, 계획 준수보다는 변화 대응.';
    }
    if (qText.includes('단위') || qText.includes('통합') || qText.includes('테스트')) {
      return '테스트 단계별 목적: 단위(개별 모듈 격리 검증) → 통합(모듈 간 인터페이스/드라이버·스텁) → 시스템(요구사항 적합성) → 인수(사용자 동의).';
    }
    if (qText.includes('결합도') || qText.includes('응집도')) {
      return '결합도(낮을수록 우수: 자-스-제-외-공-내), 응집도(높을수록 우수: 우-논-시-절-통-순-기).';
    }
    return `해당 문항은 [${q.ncs_module} 도메인]의 출제 빈출 영역입니다. 선지의 절대적 단어(항상, 오직, 불가능하다)나 선후 관계가 왜곡된 보기를 유의하여 소거법으로 접근해보세요.`;
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center text-slate-400 font-mono text-sm">
        기출문제 카드 덱을 불러오는 중...
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return null;
  }

  const currentQ = activeQuestions[currentIndex];
  const isScrapped = currentQ ? scrappedIds.includes(currentQ.id) : false;
  const isAnswered = selectedChoice !== null;
  const isCorrect = currentQ && selectedChoice === currentQ.answer;

  const scrappedCountInModule = allQuestions.filter((q) => scrappedIds.includes(q.id)).length;

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3.5 border border-sky-500/20 shadow-xl relative overflow-hidden select-none"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Compact Title & Minimal Icon Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        {/* Left: Module Tag & Source */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-sky-500/15 text-sky-400 border border-sky-500/25 shrink-0">
            {moduleCode}
          </span>
          {currentQ && (
            <span className="text-xs text-slate-400 font-mono truncate">
              {currentQ.source} • {currentQ.exam_title}
            </span>
          )}
        </div>

        {/* Right: Minimal Compact Icon Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mode Tabs (Icon Only) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-800/90">
            <button
              onClick={() => setFilterMode('all')}
              title={`전체 문항 (${allQuestions.length})`}
              className={`p-1.5 rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFilterMode('scrapped')}
              title={`스크랩 복습 (${scrappedCountInModule})`}
              className={`p-1.5 rounded-md transition-colors relative ${
                filterMode === 'scrapped'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              {scrappedCountInModule > 0 && filterMode !== 'scrapped' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          {/* Global Hint Toggle (Icon Only) */}
          <button
            onClick={toggleGlobalHint}
            title={globalHintEnabled ? '힌트 끄기' : '힌트 켜기'}
            className={`p-1.5 rounded-lg border transition-all ${
              globalHintEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Lightbulb
              className={`w-3.5 h-3.5 ${globalHintEnabled ? 'text-amber-400 fill-amber-400/20' : ''}`}
            />
          </button>

          {/* Scrap Current Question (Icon Only) */}
          {currentQ && (
            <button
              onClick={() => toggleScrap(currentQ.id)}
              title={isScrapped ? '스크랩 해제' : '문항 스크랩'}
              className={`p-1.5 rounded-lg border transition-all ${
                isScrapped
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-400'
              }`}
            >
              {isScrapped ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Reset Card (Icon Only) */}
          <button
            onClick={handleReset}
            title="다시 풀기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* If No Questions in Scrapped Mode */}
      {activeQuestions.length === 0 ? (
        <div className="py-10 text-center space-y-2.5">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-300 text-sm font-medium">스크랩된 문항이 없습니다.</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            문제를 풀다가 오답이 나거나 다시 볼 문항의 북마크 아이콘을 누르면 이곳에 모입니다.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600/30 text-sky-400 border border-sky-500/40 hover:bg-sky-600/50"
          >
            전체 문항 풀러가기
          </button>
        </div>
      ) : (
        <>
          {/* Progress Bar & Inline Stepper Icons Header */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono text-slate-400">
            {/* Left: Current Progress & Progress Bar */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-sky-400 font-bold shrink-0 text-xs">
                {currentIndex + 1} / {activeQuestions.length}
              </span>
              <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-1 transition-all duration-300 ${
                    filterMode === 'scrapped'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-sky-400 to-blue-600'
                  }`}
                  style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Right: Integrated Stepper Navigation (< > Icons) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                title="이전 문항 (←)"
                className={`p-1.5 rounded-lg border transition-all ${
                  currentIndex === 0
                    ? 'text-slate-700 bg-slate-900/30 border-slate-900 cursor-not-allowed'
                    : 'text-slate-300 bg-slate-900/80 border-slate-800 hover:text-white hover:bg-slate-800 shadow-sm'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === activeQuestions.length - 1}
                title="다음 문항 (→)"
                className={`p-1.5 rounded-lg border transition-all ${
                  currentIndex === activeQuestions.length - 1
                    ? 'text-slate-700 bg-slate-900/30 border-slate-900 cursor-not-allowed'
                    : 'text-sky-300 bg-sky-950/40 border-sky-600/40 hover:text-white hover:bg-sky-600 shadow-sm'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Card Box (Supports Touch Swipe) */}
          <div className="space-y-3.5">
            <FormattedQuestion
              questionIndex={currentIndex + 1}
              rawText={currentQ.question}
            />

            {/* Choices */}
            <div className="space-y-2">
              {currentQ.choices.map((choice) => {
                const isThisSelected = selectedChoice === choice.number;
                const isThisCorrect = choice.number === currentQ.answer;

                let cardStyle =
                  'border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-sky-500/40 hover:bg-slate-800/60';
                let circleStyle = 'bg-slate-800 text-slate-400 border-slate-700';

                if (isAnswered) {
                  if (isThisCorrect) {
                    cardStyle =
                      'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-medium';
                    circleStyle = 'bg-emerald-500 text-black border-emerald-400 font-bold';
                  } else if (isThisSelected && !isThisCorrect) {
                    cardStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-200';
                    circleStyle = 'bg-rose-500 text-white border-rose-400 font-bold';
                  } else {
                    cardStyle = 'border-slate-800/40 bg-slate-900/30 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={choice.number}
                    onClick={() => handleSelectChoice(choice.number)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group cursor-pointer ${cardStyle}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 border mt-0.5 transition-colors ${circleStyle}`}
                    >
                      {choice.number}
                    </span>
                    <span className="text-xs sm:text-sm leading-snug pt-0.5">{choice.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Hint Reserve Container (Zero CLS: Pre-allocated height) */}
            <div className="min-h-[3.5rem] transition-all duration-200">
              {globalHintEnabled ? (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 fill-amber-400/20" />
                    <div>
                      <span className="font-mono font-bold text-amber-400 mr-1.5">[HINT]</span>
                      <span>{getQuestionHint(currentQ)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-slate-800/40 rounded-xl flex items-center justify-center text-slate-600 text-[11px] font-mono select-none px-3 py-2">
                  <span className="flex items-center gap-1.5 opacity-50">
                    <Lightbulb className="w-3 h-3" />
                    상단 힌트 토글을 켜면 핵심 단서가 표시됩니다 (터치 스와이프로 다음 문항 이동)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Answer & Explanation Toggle Panel */}
          {isAnswered && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${
                isCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                        정답 (정답: {currentQ.answer}번)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-rose-400 text-xs sm:text-sm">
                        오답 (정답: {currentQ.answer}번)
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowExplanation((prev) => !prev)}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-mono flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showExplanation ? '해설 닫기' : '해설 보기'}
                </button>
              </div>

              {showExplanation && (
                <div className="pt-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800 whitespace-pre-line font-sans">
                  {currentQ.explain || `정답은 ${currentQ.answer}번입니다.`}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { FormattedQuestion } from './FormattedQuestion';

interface Choice {
  number: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  source?: string;
  exam_title?: string;
  chapter?: string;
  ncs_module: string;
  subtopic_id?: string;
  ncs_title?: string;
  question: string;
  choices: Choice[];
  answer: number;
  explain?: string;
}

interface TopicQuizCardDeckProps {
  moduleCode: string; // e.g. "M1", "M2"
  subTopicCode?: string; // e.g. "1-1", "1-2"
  moduleTitle?: string;
}

const STORAGE_KEY = 'ncs_scrapped_questions_v1';
const HINT_PREF_KEY = 'ncs_global_hint_enabled_v1';
const ANSWERS_STORAGE_KEY = 'ncs_quiz_answers_v1';

interface QuizAnswerRecord {
  selectedChoice: number;
  isCorrect: boolean;
  solvedAt: number;
}

export function TopicQuizCardDeck({ moduleCode, subTopicCode, moduleTitle }: TopicQuizCardDeckProps) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [globalHintEnabled, setGlobalHintEnabled] = useState(false);
  const [filterMode, setFilterMode] = useState<'subtopic' | 'all' | 'scrapped'>('subtopic');
  const [scrappedIds, setScrappedIds] = useState<string[]>([]);
  const [answersHistory, setAnswersHistory] = useState<Record<string, QuizAnswerRecord>>({});
  const [isJumpInputOpen, setIsJumpInputOpen] = useState(false);
  const [jumpInputValue, setJumpInputValue] = useState('');
  const jumpInputRef = useRef<HTMLInputElement>(null);

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
      const savedAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);
      if (savedAnswers) {
        setAnswersHistory(JSON.parse(savedAnswers));
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

  // If subTopicCode is not provided, fallback to 'all'
  useEffect(() => {
    if (!subTopicCode) {
      setFilterMode('all');
    }
  }, [subTopicCode]);

  // Active question list according to filter mode
  const activeQuestions = useMemo(() => {
    if (filterMode === 'scrapped') {
      return allQuestions.filter((q) => scrappedIds.includes(q.id));
    }
    if (filterMode === 'subtopic' && subTopicCode) {
      const subFiltered = allQuestions.filter((q) => q.subtopic_id === subTopicCode);
      return subFiltered.length > 0 ? subFiltered : allQuestions;
    }
    return allQuestions;
  }, [allQuestions, filterMode, subTopicCode, scrappedIds]);

  // Sync current question's saved answer from answersHistory
  useEffect(() => {
    const currentQ = activeQuestions[currentIndex];
    if (currentQ && answersHistory[currentQ.id]) {
      const record = answersHistory[currentQ.id];
      setSelectedChoice(record.selectedChoice);
      setShowExplanation(true);
    } else {
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  }, [currentIndex, activeQuestions, answersHistory]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterMode, activeQuestions.length]);

  // Toggle Scrap
  const toggleScrap = (id: string) => {
    setScrappedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save scrap to storage', e);
      }
      return updated;
    });
  };

  // Toggle Global Hint Preference
  const toggleGlobalHint = () => {
    const nextState = !globalHintEnabled;
    setGlobalHintEnabled(nextState);
    try {
      localStorage.setItem(HINT_PREF_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.error('Failed to save hint preference to storage', e);
    }
  };

  // Stepper handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Jump to Question handlers
  const handleOpenJumpInput = () => {
    setJumpInputValue(String(currentIndex + 1));
    setIsJumpInputOpen(true);
    setTimeout(() => {
      jumpInputRef.current?.focus();
      jumpInputRef.current?.select();
    }, 50);
  };

  const handleCommitJump = () => {
    const targetNum = parseInt(jumpInputValue.trim(), 10);
    if (!isNaN(targetNum) && targetNum >= 1 && targetNum <= activeQuestions.length) {
      setCurrentIndex(targetNum - 1);
    }
    setIsJumpInputOpen(false);
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommitJump();
    } else if (e.key === 'Escape') {
      setIsJumpInputOpen(false);
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (deltaX > minSwipeDistance) {
      // Swiped Left -> Next
      handleNext();
    } else if (deltaX < -minSwipeDistance) {
      // Swiped Right -> Prev
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleChoiceSelect = (choiceNumber: number) => {
    if (selectedChoice !== null) return; // Prevent changing after selection
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    const isAnsCorrect = choiceNumber === currentQ.answer;
    setSelectedChoice(choiceNumber);
    setShowExplanation(true);

    // Save answer to history & localStorage
    const newRecord: QuizAnswerRecord = {
      selectedChoice: choiceNumber,
      isCorrect: isAnsCorrect,
      solvedAt: Date.now(),
    };

    setAnswersHistory((prev) => {
      const updated = { ...prev, [currentQ.id]: newRecord };
      try {
        localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save quiz answer record', e);
      }
      return updated;
    });

    // Auto-scrap wrong answers
    if (!isAnsCorrect) {
      if (!scrappedIds.includes(currentQ.id)) {
        toggleScrap(currentQ.id);
      }
    }
  };

  // Reset answer for current question to retry
  const handleResetCurrentAnswer = () => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    setSelectedChoice(null);
    setShowExplanation(false);

    setAnswersHistory((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      try {
        localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update answers history on reset', e);
      }
      return updated;
    });
  };

  // Generate question hint safely without spoiling the answer
  const getQuestionHint = (q: Question) => {
    const qText = q.question.toLowerCase();
    const ex = q.explain || '';

    // Specific domain principles
    if (qText.includes('나선형') || qText.includes('spiral')) {
      return '나선형 모델의 4대 활동(계획-위험분석-공학개발-고객평가) 중 핵심 차별점은 위험 분석(Risk Analysis)입니다.';
    }
    if (qText.includes('폭포수') || qText.includes('waterfall')) {
      return '폭포수 모델은 순차적·하향식 선형 모형으로 이전 단계 완료 및 명확한 산출물 검증 후 다음 단계로 진행합니다.';
    }
    if (qText.includes('스크럼') || qText.includes('scrum')) {
      return '스크럼 활동의 목적을 대조하세요: 스프린트 리뷰는 제품 시연 및 피드백, 회고(Retrospective)는 팀 프로세스 개선입니다.';
    }
    if (qText.includes('xp') || qText.includes('익스트림')) {
      return 'XP의 5대 가치(용기, 단순성, 의사소통, 피드백, 존중)와 12대 실천 프랙티스(TDD, 짝 프로그래밍, CI 등)를 점검하세요.';
    }
    if (qText.includes('애자일') || qText.includes('agile')) {
      return '애자일 핵심 가치: 문서보다 동작하는 소프트웨어, 계획보다 변화 대응, 프로세스보다 개인과 상호작용, 협상보다 협력.';
    }
    if (qText.includes('단위') || qText.includes('통합') || qText.includes('인수')) {
      return '테스트 레벨별 목적: 단위(개별 컴포넌트 검증) → 통합(모듈 간 인터페이스) → 시스템(전체 기능/비기능) → 인수(사용자 요구 충족).';
    }
    if (qText.includes('결합도') || qText.includes('응집도')) {
      return '결합도(낮을수록 우수: 자-스-제-외-공-내), 응집도(높을수록 우수: 우-논-시-절-통-순-기)의 서열 규칙을 확인하세요.';
    }
    if (qText.includes('리팩토링') || qText.includes('리팩터링')) {
      return '리팩토링은 소프트웨어의 겉보기 동작(기능)은 그대로 유지하면서 내부 구조와 가독성을 개선하는 작업입니다.';
    }
    if (qText.includes('cpm') || qText.includes('임계')) {
      return '임계 경로(Critical Path)는 프로젝트 완료를 위한 최장 경로이며, 여유 시간(Slack)이 0인 작업들로 이어집니다.';
    }

    // Dynamic extraction from explanation (remove spoilers)
    if (ex.includes('[핵심 해설]')) {
      const parts = ex.split('[핵심 해설]');
      if (parts[1] && parts[1].length > 10) {
        const clean = parts[1].replace(/\[.*?\]/g, '').trim();
        return clean.length > 90 ? clean.substring(0, 90) + '...' : clean;
      }
    }

    return `해당 문항은 [${q.ncs_module} 도메인]의 핵심 평가 영역입니다. 발문의 핵심 키워드와 각 선지의 정합성을 꼼꼼히 대조해보세요.`;
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
  const subTopicCount = subTopicCode ? allQuestions.filter((q) => q.subtopic_id === subTopicCode).length : 0;

  return (
    <section className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 border border-sky-500/30 relative overflow-hidden shadow-2xl">
      {/* Top Header Card */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Left: Module Code, Subtopic & Question Counter */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
            {subTopicCode ? `${moduleCode} · ${subTopicCode}` : moduleCode}
          </span>

          {activeQuestions.length > 0 && (
            <div className="flex items-center font-mono text-xs text-slate-300 shrink-0">
              {isJumpInputOpen ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={jumpInputRef}
                    type="number"
                    min={1}
                    max={activeQuestions.length}
                    value={jumpInputValue}
                    onChange={(e) => setJumpInputValue(e.target.value)}
                    onBlur={handleCommitJump}
                    onKeyDown={handleJumpKeyDown}
                    className="w-12 px-1 py-0.5 text-center text-xs font-mono font-bold bg-slate-950 text-sky-400 border border-sky-500 rounded outline-none shadow-sm"
                  />
                  <span className="text-slate-500">/ {activeQuestions.length}</span>
                </div>
              ) : (
                <button
                  onClick={handleOpenJumpInput}
                  title="클릭하여 문항 번호 직접 입력"
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 font-bold hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                >
                  {currentIndex + 1} <span className="text-slate-400 font-normal">/ {activeQuestions.length}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Minimal Compact Icon Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Filter Mode Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-800/90">
            {subTopicCode && (
              <button
                onClick={() => setFilterMode('subtopic')}
                title={`주제별 기출 (${subTopicCount})`}
                className={`p-1.5 rounded-md transition-colors ${
                  filterMode === 'subtopic'
                    ? 'bg-sky-600 text-white shadow-sm font-mono text-[11px] font-bold px-2'
                    : 'text-slate-400 hover:text-slate-200 text-[11px] font-mono px-2'
                }`}
              >
                {subTopicCode}
              </button>
            )}
            <button
              onClick={() => setFilterMode('all')}
              title={`모듈 전체 문항 (${allQuestions.length})`}
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

          {/* Global Hint Toggle */}
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

          {/* Retry Current Question Button */}
          {selectedChoice !== null && (
            <button
              onClick={handleResetCurrentAnswer}
              title="현재 문항 다시 풀기 (답안 초기화)"
              className="p-1.5 rounded-lg border bg-slate-900/80 text-slate-400 border-slate-800 hover:text-sky-300 hover:border-sky-500/40 transition-all flex items-center gap-1 text-[11px] font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다시풀기</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar + Stepper Navigation */}
      {activeQuestions.length > 0 && (
        <div className="flex items-center gap-2">
          {/* Stepper Left (<) */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-1 rounded-md transition-all shrink-0 ${
              currentIndex === 0
                ? 'text-slate-600 cursor-not-allowed opacity-40'
                : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm active:scale-95'
            }`}
            title="이전 문항"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Right (>) */}
          <button
            onClick={handleNext}
            disabled={currentIndex === activeQuestions.length - 1}
            className={`p-1 rounded-md transition-all shrink-0 ${
              currentIndex === activeQuestions.length - 1
                ? 'text-slate-600 cursor-not-allowed opacity-40'
                : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm active:scale-95'
            }`}
            title="다음 문항"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card Content with Touch Swipe Gesture */}
      {activeQuestions.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <Star className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">해당 조건의 기출문항이 없습니다.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-sky-600/80 hover:bg-sky-600 text-white transition-colors"
          >
            모듈 전체 문항 보기
          </button>
        </div>
      ) : (
        <>
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="space-y-4 touch-pan-y"
          >
            {/* Exam Metadata Info Bar & Scrap Button */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/60 pb-2">
              <div className="flex items-center gap-2 truncate">
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                  {currentQ.source || '공식기출'}
                </span>
                {currentQ.exam_title && <span className="truncate">{currentQ.exam_title}</span>}
              </div>
              <button
                onClick={() => toggleScrap(currentQ.id)}
                title={isScrapped ? '스크랩 해제' : '오답노트 스크랩'}
                className={`p-1 rounded transition-colors ${
                  isScrapped ? 'text-amber-400' : 'text-slate-500 hover:text-amber-300'
                }`}
              >
                <Star className={`w-4 h-4 ${isScrapped ? 'fill-amber-400' : ''}`} />
              </button>
            </div>

            {/* Smart Question Formatter */}
            <FormattedQuestion questionIndex={currentIndex + 1} rawText={currentQ.question} />

            {/* Zero-Layout-Shift Hint Box */}
            <div
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                globalHintEnabled
                  ? 'bg-amber-500/5 border-amber-500/25 p-3 sm:p-3.5 opacity-100 max-h-48'
                  : 'max-h-0 opacity-0 border-transparent p-0 m-0 pointer-events-none'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    핵심 개념 힌트
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                    {getQuestionHint(currentQ)}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Choices */}
            <div className="space-y-2 pt-1">
              {currentQ.choices.map((choice) => {
                const isSelected = selectedChoice === choice.number;
                const isAnswer = choice.number === currentQ.answer;

                let btnStyle =
                  'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200';
                let badgeStyle = 'bg-slate-800 text-slate-400';

                if (isAnswered) {
                  if (isAnswer) {
                    btnStyle =
                      'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 font-medium shadow-sm';
                    badgeStyle = 'bg-emerald-500 text-black font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'bg-rose-950/40 border-rose-500/80 text-rose-200 font-medium shadow-sm';
                    badgeStyle = 'bg-rose-500 text-white font-bold';
                  } else {
                    btnStyle = 'opacity-50 border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={choice.number}
                    disabled={isAnswered}
                    onClick={() => handleChoiceSelect(choice.number)}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[11px] font-mono transition-colors mt-0.5 ${badgeStyle}`}
                    >
                      {choice.number}
                    </span>
                    <span className="leading-relaxed font-sans">{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Status & Explanation Accordion */}
          {isAnswered && (
            <div
              className={`rounded-xl p-3 sm:p-4 border transition-all space-y-2 animate-in fade-in-50 duration-200 ${
                isCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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

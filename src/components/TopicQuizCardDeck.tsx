'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';

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

export function TopicQuizCardDeck({ moduleCode, moduleTitle }: TopicQuizCardDeckProps) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'scrapped'>('all');
  const [scrappedIds, setScrappedIds] = useState<string[]>([]);

  // 1. Load scrapped questions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setScrappedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load scrapped questions from storage', e);
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

  const handleSelectChoice = (choiceNum: number) => {
    setSelectedChoice(choiceNum);
    setShowExplanation(true);

    const currentQ = activeQuestions[currentIndex];
    // Automatically scrap when answered incorrectly
    if (currentQ && choiceNum !== currentQ.answer && !scrappedIds.includes(currentQ.id)) {
      toggleScrap(currentQ.id);
    }
  };

  const handleReset = () => {
    setSelectedChoice(null);
    setShowExplanation(false);
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
    <section className="glass-panel rounded-2xl p-5 sm:p-8 space-y-6 border border-sky-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls: Mode Switcher & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {moduleCode} 실전 기출
            </span>
            {currentQ && (
              <span className="text-xs text-slate-400 font-mono">
                {currentQ.source} • {currentQ.exam_title}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            {moduleTitle ? `${moduleTitle} 기출 완전정복` : '토픽별 기출 한 문항 학습'}
          </h3>
        </div>

        {/* Filter Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>전체 ({allQuestions.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('scrapped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'scrapped'
                  ? 'bg-amber-500 text-black font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>스크랩 복습 ({scrappedCountInModule})</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            title="다시 풀기"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800/80"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* If No Questions in Scrapped Mode */}
      {activeQuestions.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium">스크랩된 문항이 없습니다.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            문제를 풀다가 오답이 나거나 다시 보고 싶은 문항에서 우측 상단의 북마크 버튼을 누르면
            이곳에 자동으로 모입니다.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600/30 text-sky-400 border border-sky-500/40 hover:bg-sky-600/50"
          >
            전체 문항 풀러가기
          </button>
        </div>
      ) : (
        <>
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">
                {currentIndex + 1} / {activeQuestions.length} 문항
              </span>
              {filterMode === 'scrapped' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                  오답/스크랩 복습 모드
                </span>
              )}
            </div>

            {/* Scrap Bookmark Toggle Button */}
            <button
              onClick={() => toggleScrap(currentQ.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                isScrapped
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-500/30'
              }`}
            >
              {isScrapped ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>스크랩됨</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>문항 스크랩</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 transition-all duration-300 ${
                filterMode === 'scrapped'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                  : 'bg-gradient-to-r from-sky-400 to-blue-600'
              }`}
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card Box */}
          <div className="space-y-5">
            <div className="text-slate-100 font-medium text-base sm:text-lg leading-relaxed">
              <span className="text-sky-400 font-bold mr-2">Q{currentIndex + 1}.</span>
              {currentQ.question}
            </div>

            {/* Choices */}
            <div className="space-y-2.5">
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
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 border mt-0.5 transition-colors ${circleStyle}`}
                    >
                      {choice.number}
                    </span>
                    <span className="text-sm sm:text-base leading-snug pt-0.5">{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer & Explanation Toggle Panel */}
          {isAnswered && (
            <div
              className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                isCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-emerald-400 text-sm sm:text-base">
                        정답입니다! (정답: {currentQ.answer}번)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <span className="font-bold text-rose-400 text-sm sm:text-base">
                        오답입니다. (정답: {currentQ.answer}번)
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
                <div className="pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 whitespace-pre-line font-sans">
                  {currentQ.explain || `정답은 ${currentQ.answer}번입니다.`}
                </div>
              )}
            </div>
          )}

          {/* Navigation Footer (Prev / Next Buttons) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentIndex === 0
                  ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
                  : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white shadow-sm'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 문항</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentIndex === activeQuestions.length - 1
                  ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
                  : filterMode === 'scrapped'
                  ? 'text-black bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                  : 'text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20'
              }`}
            >
              <span>다음 문항</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

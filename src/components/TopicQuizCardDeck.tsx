'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';

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

export function TopicQuizCardDeck({ moduleCode, moduleTitle }: TopicQuizCardDeckProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/data/ncs_questions.json');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data: Question[] = await res.json();
        const filtered = data.filter((q) => q.ncs_module === moduleCode);
        setQuestions(filtered);
      } catch (err) {
        console.error('Failed to load topic questions', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [moduleCode]);

  // Reset answer states when question changes
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
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
    setShowExplanation(true); // Automatically show explanation on answer selection
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

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIndex];
  const isAnswered = selectedChoice !== null;
  const isCorrect = selectedChoice === currentQ.answer;

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-8 space-y-6 border border-sky-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {moduleCode} 실전 기출
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentQ.source} • {currentQ.exam_title}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            {moduleTitle ? `${moduleTitle} 기출 완전정복` : '토픽별 기출 한 문항 학습'}
          </h3>
        </div>

        {/* Card Counter & Progress */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-sky-400 font-bold bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            {currentIndex + 1} / {questions.length} 문항
          </div>
          <button
            onClick={handleReset}
            title="다시 풀기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-400 to-blue-600 h-1.5 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card Box */}
      <div className="space-y-5">
        {/* Question Text */}
        <div className="text-slate-100 font-medium text-base sm:text-lg leading-relaxed">
          <span className="text-sky-400 font-bold mr-2">Q{currentIndex + 1}.</span>
          {currentQ.question}
        </div>

        {/* Choices (Clickable Cards) */}
        <div className="space-y-2.5">
          {currentQ.choices.map((choice) => {
            const isThisSelected = selectedChoice === choice.number;
            const isThisCorrect = choice.number === currentQ.answer;

            let cardStyle =
              'border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-sky-500/40 hover:bg-slate-800/60';
            let circleStyle = 'bg-slate-800 text-slate-400 border-slate-700';

            if (isAnswered) {
              if (isThisCorrect) {
                cardStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-medium';
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
          disabled={currentIndex === questions.length - 1}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            currentIndex === questions.length - 1
              ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
              : 'text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20'
          }`}
        >
          <span>다음 문항</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import {
  ShieldAlert,
  LogIn,
  LogOut,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
} from 'lucide-react';
import { FormattedQuestion } from '@/components/FormattedQuestion';

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
  ncs_module?: string;
  subtopic_id?: string;
  era?: string;
  topic?: string;
  question: string;
  choices: Choice[];
  answer: number;
  explain?: string;
}

// Client-side whitelist (can be configured via NEXT_PUBLIC_ADMIN_EMAILS or fallback to empty array)
const clientAllowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminQuizDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Subject: 'swe' (소프트웨어공학) vs 'history' (한국사)
  const [selectedSubject, setSelectedSubject] = useState<'swe' | 'history'>('swe');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Quiz Interaction State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<Record<string, { choice: number; isCorrect: boolean }>>({});
  const [scrappedIds, setScrappedIds] = useState<string[]>([]);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setIdToken(token);
        loadUserFirestoreData(currentUser.uid);
      } else {
        setIdToken(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load User Quiz History from Cloud Firestore
  const loadUserFirestoreData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.quiz_answers) setAnswersHistory(data.quiz_answers);
        if (data.scrapped_ids) setScrappedIds(data.scrapped_ids);
      }
    } catch (e) {
      console.error('Failed to load history from Firestore', e);
    }
  };

  // 3. Save User Quiz History to Cloud Firestore
  const saveAnswerToFirestore = async (qId: string, choice: number, isCorrect: boolean) => {
    if (!user) return;
    const updated = {
      ...answersHistory,
      [qId]: { choice, isCorrect, answeredAt: Date.now() },
    };
    setAnswersHistory(updated);

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { quiz_answers: updated }, { merge: true });
    } catch (e) {
      console.error('Failed to sync quiz answer to Firestore', e);
    }
  };

  // 4. Fetch Questions via Admin Protected API
  useEffect(() => {
    if (!user || !idToken) return;

    async function fetchQuestions() {
      setDataLoading(true);
      try {
        const url = selectedSubject === 'history'
          ? '/api/admin/quiz?subject=history'
          : '/api/admin/quiz';

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (res.ok) {
          const result = await res.json();
          setQuestions(result.questions || []);
          setCurrentIndex(0);
        } else {
          console.error('Failed to fetch private questions');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchQuestions();
  }, [user, idToken, selectedSubject]);

  // Sync choice for current question
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && answersHistory[currentQ.id]) {
      setSelectedChoice(answersHistory[currentQ.id].choice);
      setShowExplanation(true);
    } else {
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  }, [currentIndex, questions, answersHistory]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setQuestions([]);
  };

  // If NEXT_PUBLIC_ADMIN_EMAILS is provided, check against it; otherwise authorize logged-in user to try backend API
  const isAdmin = user && (clientAllowedEmails.length === 0 || clientAllowedEmails.some((a) => user.email?.toLowerCase().includes(a)));

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 font-mono">
        인증 세션 확인 중...
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6 text-center">
        <div className="glass-panel rounded-2xl p-8 space-y-5 border border-sky-500/30">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-100">관리자 실전 기출 학습실</h1>
            <p className="text-xs text-slate-400">
              저작권 및 배포 보안을 위해 구글 인증된 관리자만 접근 가능합니다.
            </p>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-sky-600" />
            <span>Google 계정으로 로그인</span>
          </button>
        </div>
      </div>
    );
  }

  // Unauthorized Email
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="glass-panel rounded-2xl p-8 space-y-4 border border-rose-500/40 bg-rose-950/10">
          <ShieldAlert className="w-10 h-10 mx-auto text-rose-400" />
          <h2 className="text-lg font-bold text-rose-200">접근 권한 제한 (403)</h2>
          <p className="text-xs text-slate-400">
            인증된 계정(<code>{user.email}</code>)은 관리자 화이트리스트에 등록되어 있지 않습니다.
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = selectedChoice !== null;
  const isCorrect = currentQ && selectedChoice === currentQ.answer;

  return (
    <div className="space-y-6">
      {/* Top Admin Status Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-sky-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-400 bg-slate-800 shrink-0">
            {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">{user.displayName || '관리자'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                인증됨
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{user.email}</span>
          </div>
        </div>

        {/* Subject Switch Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setSelectedSubject('swe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedSubject === 'swe'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            소프트웨어공학 (467제)
          </button>
          <button
            onClick={() => setSelectedSubject('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedSubject === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            한국사 (40제)
          </button>
          <button
            onClick={handleLogout}
            title="로그아웃"
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      {dataLoading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 font-mono text-sm">
          비공개 문제 데이터 동기화 중...
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 font-mono text-sm">
          문제를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-2xl">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                {currentQ.ncs_module || currentQ.era || '기출'}
              </span>
              <span>{currentQ.chapter || currentQ.topic}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-200 font-bold">
                {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed whitespace-pre-line">
              Q{currentIndex + 1}. {currentQ.question}
            </h2>

            {/* Choices */}
            <div className="space-y-2.5 pt-2">
              {currentQ.choices.map((c) => {
                const isSelected = selectedChoice === c.number;
                let btnStyle = 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-200';
                if (isAnswered) {
                  if (c.number === currentQ.answer) {
                    btnStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-300 font-semibold';
                  } else {
                    btnStyle = 'border-slate-800/40 opacity-40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={c.number}
                    disabled={isAnswered}
                    onClick={() => {
                      setSelectedChoice(c.number);
                      setShowExplanation(true);
                      saveAnswerToFirestore(currentQ.id, c.number, c.number === currentQ.answer);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[11px] shrink-0 mt-0.5">
                      {c.number}
                    </span>
                    <span className="leading-relaxed">{c.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Section */}
          {isAnswered && (
            <div className="space-y-3 pt-4 border-t border-slate-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">정답입니다!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-rose-400">
                        오답입니다 (정답: {currentQ.answer}번)
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowExplanation((p) => !p)}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showExplanation ? '해설 닫기' : '해설 보기'}
                </button>
              </div>

              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {currentQ.explain}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

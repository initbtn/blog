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
  Filter,
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

export default function AdminQuizDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Subject: 'swe' (소프트웨어공학) vs 'history' (한국사)
  const [selectedSubject, setSelectedSubject] = useState<'swe' | 'history'>('swe');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // User History (Stored in Firestore: users/{uid}/quiz_answers/{questionId})
  const [userAnswers, setUserAnswers] = useState<Record<string, { choice: number; is_correct: boolean }>>({});

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (e) {
          console.error('Failed to get ID token', e);
        }
      } else {
        setIdToken(null);
        setQuestions([]);
        setUserAnswers({});
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Questions based on selectedSubject
  useEffect(() => {
    if (!idToken || !user) return;

    let isMounted = true;
    setDataLoading(true);
    setIsForbidden(false);

    const fetchQuestions = async () => {
      try {
        const queryParam = selectedSubject === 'history' ? '?subject=history' : '';
        const res = await fetch(`/api/admin/quiz${queryParam}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          if (isMounted) setIsForbidden(true);
          return;
        }

        const data = await res.json();
        if (data.success && isMounted) {
          setQuestions(data.questions || []);
          setSelectedSource('all');
          setSelectedModule('all');
          setCurrentIndex(0);
          setSelectedChoice(null);
          setShowExplanation(false);
        }
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [idToken, user, selectedSubject]);

  // 3. Load user answer history from Firestore when subject or questions change
  useEffect(() => {
    if (!user || questions.length === 0) return;

    const loadHistory = async () => {
      try {
        const historyDocRef = doc(db, 'users', user.uid, 'subjects', selectedSubject);
        const snap = await getDoc(historyDocRef);
        if (snap.exists()) {
          setUserAnswers(snap.data()?.answers || {});
        } else {
          setUserAnswers({});
        }
      } catch (e) {
        console.warn('Firestore load history fallback', e);
      }
    };

    loadHistory();
  }, [user, selectedSubject, questions.length]);

  // 4. Sources and Modules taxonomy lists for filtering
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.source) set.add(q.source);
    });
    return Array.from(set).sort();
  }, [questions]);

  const availableModules = useMemo(() => {
    const map = new Map<string, string>();
    questions.forEach((q) => {
      if (q.ncs_module) {
        if (!map.has(q.ncs_module)) {
          map.set(q.ncs_module, q.chapter || q.ncs_module);
        }
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [questions]);

  // 5. Filtered questions according to selected filters
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSource !== 'all' && q.source !== selectedSource) {
        return false;
      }
      if (selectedModule !== 'all' && q.ncs_module !== selectedModule) {
        return false;
      }
      return true;
    });
  }, [questions, selectedSource, selectedModule]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setShowExplanation(false);
  }, [selectedSource, selectedModule]);

  // Sync choice selection with existing answer history
  useEffect(() => {
    if (filteredQuestions.length === 0) return;
    const currentQ = filteredQuestions[currentIndex];
    if (currentQ && userAnswers[currentQ.id]) {
      setSelectedChoice(userAnswers[currentQ.id].choice);
      setShowExplanation(true);
    } else {
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  }, [currentIndex, filteredQuestions, userAnswers]);

  // Save answer to Firestore
  const saveAnswerToFirestore = async (qId: string, choiceNum: number, isCorrect: boolean) => {
    if (!user) return;

    const updated = {
      ...userAnswers,
      [qId]: { choice: choiceNum, is_correct: isCorrect, timestamp: new Date().toISOString() },
    };
    setUserAnswers(updated);

    try {
      const historyDocRef = doc(db, 'users', user.uid, 'subjects', selectedSubject);
      await setDoc(historyDocRef, { answers: updated }, { merge: true });
    } catch (e) {
      console.error('Failed to sync answer to Firestore', e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500 dark:text-slate-400 font-mono">
        인증 세션 확인 중...
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6 text-center">
        <div className="glass-panel rounded-2xl p-8 space-y-5 border border-sky-500/30">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">관리자 실전 기출 학습실</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              저작권 및 배포 보안을 위해 구글 인증된 관리자만 접근 가능합니다.
            </p>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-sky-500 dark:text-sky-600" />
            <span>Google 계정으로 로그인</span>
          </button>
        </div>
      </div>
    );
  }

  // Forbidden (Unauthorized Email or non-admin)
  if (isForbidden) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="glass-panel rounded-2xl p-8 space-y-4 border border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10">
          <ShieldAlert className="w-10 h-10 mx-auto text-rose-500 dark:text-rose-400" />
          <h2 className="text-lg font-bold text-rose-700 dark:text-rose-200">접근 권한 제한 (403)</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            인증된 계정(<code>{user.email}</code>)은 관리자 권한이 없습니다.
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  const currentQ = filteredQuestions[currentIndex];
  const isAnswered = selectedChoice !== null;
  const isCorrect = currentQ && selectedChoice === currentQ.answer;

  return (
    <div className="space-y-6">
      {/* Top Admin Status Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-sky-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-400 bg-slate-100 dark:bg-slate-800 shrink-0">
            {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.displayName || '관리자'}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                인증됨
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{user.email}</span>
          </div>
        </div>

        {/* Subject Switch Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedSubject('swe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedSubject === 'swe'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            소프트웨어공학 (467제)
          </button>
          <button
            onClick={() => setSelectedSubject('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedSubject === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            한국사 (40제)
          </button>
          <button
            onClick={handleLogout}
            title="로그아웃"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar (기출고사/출처별 및 토픽/모듈별 필터) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-semibold">맞춤 필터</span>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="source-filter" className="text-slate-500 dark:text-slate-400 text-[11px]">
              출처:
            </label>
            <select
              id="source-filter"
              aria-label="기출고사별 필터"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
            >
              <option value="all">전체 기출고사 ({questions.length}제)</option>
              {availableSources.map((src) => {
                const count = questions.filter((q) => q.source === src).length;
                return (
                  <option key={src} value={src}>
                    {src} ({count}제)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Module Filter */}
          {availableModules.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label htmlFor="module-filter" className="text-slate-500 dark:text-slate-400 text-[11px]">
                토픽:
              </label>
              <select
                id="module-filter"
                aria-label="토픽별 필터"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="all">전체 토픽 ({questions.length}제)</option>
                {availableModules.map(([mod, title]) => {
                  const count = questions.filter((q) => q.ncs_module === mod).length;
                  return (
                    <option key={mod} value={mod}>
                      {mod}: {title} ({count}제)
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
          선택된 풀이 범위: <span className="font-bold text-sky-600 dark:text-sky-400">{filteredQuestions.length}</span>문항
        </div>
      </div>

      {/* Main Quiz Area */}
      {dataLoading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
          비공개 문제 데이터 동기화 중...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
          선택한 필터 조건에 해당하는 문제가 없습니다.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">
                {currentQ.source || currentQ.ncs_module || currentQ.era || '기출'}
              </span>
              <span>{currentQ.chapter || currentQ.topic}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentIndex === filteredQuestions.length - 1}
                  onClick={() => setCurrentIndex((p) => Math.min(filteredQuestions.length - 1, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
              Q{currentIndex + 1}. {currentQ.question}
            </h2>

            {/* Choices */}
            <div className="space-y-2.5 pt-2">
              {currentQ.choices.map((c) => {
                const isSelected = selectedChoice === c.number;
                let btnStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-sky-500/50 text-slate-800 dark:text-slate-200';
                if (isAnswered) {
                  if (c.number === currentQ.answer) {
                    btnStyle = 'border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500/60 bg-rose-500/10 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold';
                  } else {
                    btnStyle = 'border-slate-200/40 dark:border-slate-800/40 opacity-40 text-slate-400 dark:text-slate-500';
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
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">정답입니다!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        오답입니다 (정답: {currentQ.answer}번)
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowExplanation((p) => !p)}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showExplanation ? '해설 닫기' : '해설 보기'}
                </button>
              </div>

              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Check, Share2, Copy, CheckCheck, Loader2, X, Bell, LogIn, LogOut, GraduationCap, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export function HeaderActions() {
  const { user, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeResult, setSubscribeResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // 공유하기 (Web Share API 지원 시 네이티브 시트, 미지원 시 클립보드 복사)
  const handleShare = async () => {
    const shareData = {
      title: 'domlog | Full-Stack & AI Systems Builder',
      text: '웹 풀스택 시스템, 실시간 데이터 파이프라인, AI RAG 에이전트 엔지니어링 저널',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    // Fallback: URL 복사
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // 구독하기 폼 제출
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubscribeResult(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubscribeResult({ success: true, msg: '구독 신청이 완료되었습니다. 환영합니다!' });
        setEmail('');
      } else {
        setSubscribeResult({ success: false, msg: data.error || '구독 신청 중 오류가 발생했습니다.' });
      }
    } catch {
      setSubscribeResult({ success: false, msg: '네트워크 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1 sm:gap-1.5">
      {/* ── 0. 테마 토글 (Dark / Light) ── */}
      <ThemeToggle />

      {/* ── 1. 구독하기 버튼 (벨 아이콘) ── */}
      <button
        onClick={() => {
          setIsSubscribeOpen(!isSubscribeOpen);
          setIsProfileOpen(false);
          setSubscribeResult(null);
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 dark:hover:bg-amber-500/20 transition-all text-xs font-semibold cursor-pointer"
        title="새 아티클 이메일 구독"
        aria-label="블로그 구독하기"
      >
        <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:inline">구독하기</span>
      </button>

      {/* ── 2. 공유하기 버튼 ── */}
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-sky-500/60 hover:text-sky-600 dark:hover:text-sky-300 transition-colors text-xs font-medium cursor-pointer"
        title="현재 페이지 공유/링크 복사"
        aria-label="공유하기"
      >
        {copied ? (
          <>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">복사됨!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span className="hidden sm:inline">공유</span>
          </>
        )}
      </button>

      {/* ── 3. Google Auth 로그인 / 프로필 액션 ── */}
      {loading ? (
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center animate-pulse">
          <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
        </div>
      ) : user ? (
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsSubscribeOpen(false);
            }}
            className="flex items-center gap-1 p-0.5 rounded-full border border-sky-500/50 hover:border-sky-400 focus:outline-none transition-transform hover:scale-105 cursor-pointer"
            aria-label="사용자 프로필 메뉴"
            title={user.email || '프로필'}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="관리자 프로필"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
          </button>

          {/* 프로필 팝오버 드롭다운 */}
          {isProfileOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 p-3 rounded-2xl glass-panel border border-sky-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
              <div className="px-1 py-0.5 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.displayName || '사용자'}
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {user.email}
                </p>
              </div>

              {isAdmin && (
                <Link
                  href="/admin/quiz"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-semibold transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>기출 학습실 바로가기</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={loginWithGoogle}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-sky-500/60 hover:text-sky-600 dark:hover:text-sky-300 transition-colors text-xs font-medium cursor-pointer"
          title="Google 로그인"
          aria-label="Google 로그인"
        >
          <LogIn className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span className="hidden sm:inline">로그인</span>
        </button>
      )}

      {/* ── 구독 팝업 모달 (Popover) ── */}
      {isSubscribeOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-88 p-4 rounded-2xl glass-panel border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">새 글 발행 이메일 알림</h3>
            </div>
            <button
              onClick={() => setIsSubscribeOpen(false)}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 py-3 leading-relaxed">
            웹 풀스택, AI 에이전트, 실시간 시스템 아키텍처의 새로운 실무 글이 공개되면 가장 먼저 메일로 소식을 전해드립니다.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                className="flex-1 text-xs bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>신청</span>
                )}
              </button>
            </div>

            {subscribeResult && (
              <div
                className={`p-2 rounded-xl text-[11px] leading-relaxed border ${
                  subscribeResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                }`}
              >
                {subscribeResult.msg}
              </div>
            )}
          </form>

          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500 font-mono text-center">
            스팸 없이 오직 신규 아티클 공개 시에만 발송됩니다.
          </div>
        </div>
      )}
    </div>
  );
}

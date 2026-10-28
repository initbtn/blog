'use client';

import { useState } from 'react';
import { Mail, Check, Share2, Copy, CheckCheck, Loader2, X, Bell } from 'lucide-react';

export function HeaderActions() {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
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
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribeResult({ success: true, msg: data.message });
        setEmail('');
      } else {
        setSubscribeResult({ success: false, msg: data.error || '구독 신청에 실패했습니다.' });
      }
    } catch (err: any) {
      setSubscribeResult({ success: false, msg: '네트워크 연결 상태를 확인해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      {/* ── 1. 구독하기 버튼 ── */}
      <button
        onClick={() => {
          setIsSubscribeOpen(!isSubscribeOpen);
          setSubscribeResult(null);
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-semibold"
        title="새 아티클 이메일 구독"
        aria-label="블로그 구독하기"
      >
        <Bell className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">구독하기</span>
      </button>

      {/* ── 2. 공유하기 버튼 ── */}
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:border-sky-500/60 hover:text-sky-300 transition-colors text-xs font-medium"
        title="현재 페이지 공유/링크 복사"
        aria-label="공유하기"
      >
        {copied ? (
          <>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-mono text-[11px]">복사됨!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">공유</span>
          </>
        )}
      </button>

      {/* ── 구독 팝업 모달 (Popover) ── */}
      {isSubscribeOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-88 p-4 rounded-2xl glass-panel border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-100">새 글 발행 이메일 알림</h3>
            </div>
            <button
              onClick={() => setIsSubscribeOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 py-3 leading-relaxed">
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
                className="flex-1 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0"
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
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {subscribeResult.msg}
              </div>
            )}
          </form>

          <div className="pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono text-center">
            스팸 없이 오직 신규 아티클 공개 시에만 발송됩니다.
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Mail, ExternalLink, Bot } from 'lucide-react';

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="메신저 문의 위젯" className="fixed bottom-20 md:bottom-6 right-5 z-40">
      {/* Expanded Chat Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-2xl glass-panel border border-sky-500/30 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>문의 & 메신저</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h2>
                <p className="text-[10px] text-slate-400">1:1 실시간 대화 및 협업 문의</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="채팅창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              👋 안녕하세요! 풀스택 개발, AI 시스템 구축 또는 기술 협업 문의가 있으신가요?
              아래 메신저 또는 이메일로 바로 연결하실 수 있습니다.
            </div>

            {/* Direct Channel 1: Telegram Bot */}
            <a
              href="https://t.me/DomContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all group"
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <Send className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                <span>텔레그램 1:1 대화 (@DomContactBot)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-sky-400/70" />
            </a>

            {/* Direct Channel 2: Email fallback */}
            <a
              href="mailto:min2spapa@gmail.com"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>이메일 직접 문의 (min2spapa@gmail.com)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-center text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
            Direct Line • @initbtn
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-sky-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/30 hover:bg-sky-400 hover:scale-105 active:scale-95 transition-all"
        aria-label="문의 챗봇 열기"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">문의하기</span>
      </button>
    </aside>
  );
}

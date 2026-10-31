'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'admin';
  text: string;
  time: string;
}

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '안녕하세요! 👋 기술 문의나 협업 제안을 남겨주시면 관리자에게 텔레그램으로 전달되며, 관리자가 답장하면 이 화면에 실시간으로 표시됩니다.',
      time: '방금',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const lastTimestampRef = useRef<number>(0);

  // 세션 ID 초기화 (랜덤 8자리 영숫자)
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = Math.random().toString(36).substring(2, 10);
    }
  }, []);

  // 메시지 스크롤 최하단 이동
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isAdminTyping]);

  // 실시간 관리자 답장 & 타이핑 상태 폴링 루프 (채팅창 열려있을 때 2.5초 주기)
  useEffect(() => {
    if (!isOpen || !sessionIdRef.current) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/contact/messages?sessionId=${sessionIdRef.current}&since=${lastTimestampRef.current}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data.success) {
          // 1. 관리자 타이핑 상태 업데이트
          setIsAdminTyping(data.status === 'typing');

          // 2. 신규 도착한 관리자 메시지 추가
          if (data.messages && data.messages.length > 0) {
            const incoming: ChatMessage[] = data.messages.map((m: any) => ({
              id: m.id,
              sender: 'admin',
              text: m.text,
              time: m.timeString || '방금',
            }));

            setMessages((prev) => [...prev, ...incoming]);
            const maxTimestamp = Math.max(...data.messages.map((m: any) => m.timestamp));
            lastTimestampRef.current = maxTimestamp;
            setIsAdminTyping(false);
          }
        }
      } catch (err) {
        // silent fail on network glitch
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    const nowTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: nowTime,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '블로그 독자',
          contact: contactInfo.trim() || '미제공 (익명)',
          message: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage('텔레그램 알림 발송 완료');
      } else {
        throw new Error(data.error || '메시지 전송에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ 전송 오류: ${err.message || '네트워크 연결을 확인해주세요.'}`,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside
      aria-label="실시간 문의 챗봇"
      className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 flex flex-col items-end pointer-events-none"
    >
      {/* ── Chat Window (Interactive Area) ── */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[480px] max-h-[80vh] rounded-3xl glass-panel border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>실시간 문의 세션</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h2>
                <p className="text-[10px] font-mono text-slate-400">
                  {isAdminTyping ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <span>엔지니어 확인 중</span>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </span>
                  ) : (
                    '양방향 텔레그램 릴레이 활성'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="채팅창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Input (Optional) */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="회신받으실 이메일 또는 연락처 (선택)"
              className="w-full text-[11px] bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isAdmin = msg.sender === 'admin';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isUser
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isAdmin
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    {isAdmin && (
                      <span className="text-[10px] font-mono text-emerald-400 px-1 font-semibold">
                        엔지니어의 직접 답변
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm'
                          : isAdmin
                          ? 'bg-emerald-950/80 text-emerald-100 border border-emerald-500/40 rounded-tl-sm shadow-lg'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono px-1">
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Google-Style '...' Typing Indicator Animation */}
            {isAdminTyping && (
              <div className="flex items-start gap-2 flex-row animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-sky-400 pl-8">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px]">웹훅 전달 중...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Status Note */}
          {statusMessage && (
            <div className="px-4 py-1 bg-emerald-500/10 border-t border-emerald-500/20 text-[10px] text-emerald-400 flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              disabled={isSending}
              className="flex-1 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="p-2 rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 transition-colors shrink-0"
              aria-label="메시지 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Trigger Button (Right-Aligned) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full bg-sky-500 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl shadow-sky-500/40 hover:bg-sky-400 hover:scale-105 active:scale-95 transition-all group"
        aria-label="문의 챗봇 열기"
      >
        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>문의하기</span>
      </button>
    </aside>
  );
}

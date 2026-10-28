'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '안녕하세요! 👋 domlog 엔지니어링 블로그 실시간 문의 세션입니다. 기술 문의, 협업 제안, 아티클 피드백을 남겨주시면 텔레그램으로 즉시 알림이 전달됩니다.',
      time: '방금',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = Math.random().toString(36).substring(2, 10);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || '메시지가 성공적으로 전달되었습니다! 신속히 확인 후 답변드리겠습니다.',
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
        setStatusMessage('텔레그램 웹훅 발송 완료');
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
                <p className="text-[10px] font-mono text-slate-400">Telegram Webhook Active</p>
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
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isUser
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm'
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

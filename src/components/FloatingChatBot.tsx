'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { getRandomCodename } from '@/lib/codenames';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'admin';
  text: string;
  time: string;
}

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [codename, setCodename] = useState<string>('');
  const [realName, setRealName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [showProfileCard, setShowProfileCard] = useState<boolean>(false);
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '안녕하세요! 👋 initbtn에게 기술 문의나 협업 제안을 남겨주시면 텔레그램으로 전달되며, initbtn이 답장하면 이 화면에 실시간으로 표시됩니다.',
      time: '방금',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const lastTimestampRef = useRef<number>(0);
  const hasSentFirstMessageRef = useRef<boolean>(false);

  // 세션 ID 및 코난 코드명 초기화
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = Math.random().toString(36).substring(2, 10);
    }
    if (!codename) {
      setCodename(getRandomCodename());
    }
  }, [codename]);

  // 메시지 스크롤 최하단 이동
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isAdminTyping, showProfileCard]);

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

          // 2. 신규 도착한 관리자 메시지만 필터링 수신 (본인 메시지 둔갑 원천 차단)
          if (data.messages && data.messages.length > 0) {
            const incomingAdmin: ChatMessage[] = data.messages
              .filter((m: any) => m.sender === 'admin')
              .map((m: any) => ({
                id: m.id,
                sender: 'admin',
                text: m.text,
                time: m.timeString || '방금',
              }));

            if (incomingAdmin.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((p) => p.id));
                const newUnique = incomingAdmin.filter((m) => !existingIds.has(m.id));
                return newUnique.length > 0 ? [...prev, ...newUnique] : prev;
              });
            }

            const maxTimestamp = Math.max(...data.messages.map((m: any) => m.timestamp));
            lastTimestampRef.current = maxTimestamp;
            setIsAdminTyping(false);
          }
        }
      } catch {
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

    const currentName = realName.trim() || codename || '익명';
    const currentContact = contactInfo.trim() || '미제공';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentName,
          contact: currentContact,
          message: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage('텔레그램 알림 발송 완료');
        // 첫 질의 직후 연락처/이름 입력 카드 노출
        if (!hasSentFirstMessageRef.current && !isProfileSaved) {
          hasSentFirstMessageRef.current = true;
          setShowProfileCard(true);
        }
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

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);

    const submittedName = realName.trim() || codename;
    const submittedContact = contactInfo.trim();

    try {
      await fetch('/api/contact/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          name: submittedName,
          contact: submittedContact,
        }),
      });

      setIsProfileSaved(true);
      setShowProfileCard(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'bot',
          text: `✅ 성함이 '${submittedName}'님으로 등록되었습니다. (회신처: ${submittedContact || '미제공'})`,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setShowProfileCard(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSkipProfile = () => {
    setShowProfileCard(false);
    setIsProfileSaved(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'bot',
        text: `🕶️ 코드명 '${codename}'님으로 익명 대화를 지속합니다.`,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const currentDisplayName = realName.trim() || codename;

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
                      <span>initbtn 확인 중</span>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <span>코드명:</span>
                      <span className="text-sky-300 font-semibold">{currentDisplayName || '요원'}</span>
                    </span>
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
                        initbtn의 직접 답변
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

            {/* 1차 질의 후 인라인 성함/연락처 등록 카드 */}
            {showProfileCard && (
              <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-base">🕶️</span>
                  <div>
                    <p className="text-xs font-bold text-slate-100">
                      반갑습니다, <span className="text-sky-400">코드명 {codename}</span>님!
                    </p>
                    <p className="text-[10px] text-slate-400">
                      initbtn이 부재중일 때 답변을 전달받으실 성함과 연락처를 남겨주세요.
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder={`성함 (미입력 시 '${codename}' 유지)`}
                    className="w-full text-xs bg-slate-950/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="회신받으실 이메일 또는 연락처 (선택)"
                    className="w-full text-xs bg-slate-950/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSkipProfile}
                    disabled={isSavingProfile}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    비밀 요원으로 남기
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-3 py-1 text-[11px] font-semibold bg-sky-500 text-slate-950 rounded-lg hover:bg-sky-400 disabled:opacity-50 transition-colors"
                  >
                    {isSavingProfile ? '등록 중...' : '등록하기'}
                  </button>
                </div>
              </div>
            )}

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

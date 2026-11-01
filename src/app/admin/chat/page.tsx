'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Clock, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react';

interface RelayMessage {
  id: string;
  sessionId: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: number;
  timeString: string;
}

interface SessionInfo {
  sessionId: string;
  senderName: string;
  contact: string;
  createdAt: number;
  lastActiveAt: number;
  status: 'idle' | 'seen' | 'typing';
  unreadAdminCount: number;
  messages: RelayMessage[];
}

export default function AdminChatDashboard() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingActiveRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 세션 목록 주기적 동기화 (3초 간격)
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions || []);
          if (!selectedSessionId && data.sessions.length > 0) {
            setSelectedSessionId(data.sessions[0].sessionId);
          }
        }
      }
    } catch {
      // silent network error
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  // 선택된 세션 정보
  const activeSession = sessions.find((s) => s.sessionId === selectedSessionId);

  // 메시지 스크롤 하단 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // 실시간 타이핑 이벤트 전송 (키보드 입력 감지)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplyText(val);

    if (!selectedSessionId) return;

    // 타이핑 시작 이벤트 전송
    if (!isTypingActiveRef.current && val.trim().length > 0) {
      isTypingActiveRef.current = true;
      fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'typing', sessionId: selectedSessionId, isTyping: true }),
      }).catch(() => {});
    }

    // 타이핑 멈춤 디바운스 (2초간 입력 없으면 타이핑 해제)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingActiveRef.current) {
        isTypingActiveRef.current = false;
        fetch('/api/admin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'typing', sessionId: selectedSessionId, isTyping: false }),
        }).catch(() => {});
      }
    }, 2000);
  };

  // 답변 전송
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !replyText.trim() || isSending) return;

    setIsSending(true);
    // 타이핑 상태 즉시 해제
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingActiveRef.current = false;

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          sessionId: selectedSessionId,
          text: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText('');
        await fetchSessions();
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>상담사 실시간 세션 관제</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Live Client Session Hub & Typing Indicator
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsLoading(true);
            fetchSessions().finally(() => setIsLoading(false));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Main Workspace Layout (Left: Sessions List, Right: Active Chat) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Session List (4 cols) */}
        <div className="md:col-span-4 rounded-2xl glass-panel border border-slate-800 p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>활성 문의 세션 ({sessions.length})</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                접수된 실시간 세션이 없습니다.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.sessionId === selectedSessionId;
                const lastMsg = s.messages[s.messages.length - 1];

                return (
                  <button
                    key={s.sessionId}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {s.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{s.sessionId.slice(0, 6)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mb-1">
                      {lastMsg ? lastMsg.text : '대화 내용 없음'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{s.contact}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(s.lastActiveAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Window (8 cols) */}
        <div className="md:col-span-8 rounded-2xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
          {activeSession ? (
            <>
              {/* Active Session Info Header */}
              <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {activeSession.senderName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-sky-400 border border-slate-700">
                      #{activeSession.sessionId}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    회신처: {activeSession.contact}
                  </span>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE SESSION
                  </span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 min-h-[350px]">
                {activeSession.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${
                        isAdmin ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          isAdmin
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isAdmin ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-[75%] space-y-1 ${
                          isAdmin ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-mono">
                          <span>{isAdmin ? '엔지니어 (상담사)' : activeSession.senderName}</span>
                          <span>•</span>
                          <span>{m.timeString}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-emerald-600 text-white font-medium rounded-tr-sm shadow-md'
                              : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Box with Instant Typing Broadcast */}
              <form
                onSubmit={handleSendReply}
                className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center gap-3"
              >
                <textarea
                  value={replyText}
                  onChange={handleInputChange}
                  placeholder="답변을 작성하면 독자 화면에 실시간 '...' 애니메이션이 즉시 표시됩니다..."
                  rows={2}
                  disabled={isSending}
                  className="flex-1 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>전송</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <span>좌측에서 대화할 세션을 선택해주세요.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

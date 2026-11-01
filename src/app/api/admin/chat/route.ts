import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, addAdminMessage, setAdminTyping } from '@/lib/chatStore';

export async function GET() {
  const sessions = getAllSessions();
  return NextResponse.json({
    success: true,
    sessions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId, text, isTyping } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId가 필요합니다.' }, { status: 400 });
    }

    // 1. 상담사 실시간 키 입력 타이핑 이벤트
    if (action === 'typing') {
      setAdminTyping(sessionId, Boolean(isTyping));
      return NextResponse.json({ success: true, typing: isTyping });
    }

    // 2. 답변 전송 이벤트
    if (action === 'send') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return NextResponse.json({ success: false, error: '답변 내용을 입력해주세요.' }, { status: 400 });
      }
      const msg = addAdminMessage(sessionId, text.trim());
      return NextResponse.json({ success: true, message: msg });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 action입니다.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

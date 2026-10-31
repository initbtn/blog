import { NextRequest, NextResponse } from 'next/server';
import { addRelayMessage, setSessionStatus } from '@/lib/chatStore';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. 텔레그램 메시지 추출
    const message = update.message || update.edited_message;
    if (!message) {
      return NextResponse.json({ ok: true, ignored: 'no message' });
    }

    const replyTo = message.reply_to_message;
    const text = message.text || '';

    // 2. 관리자가 보낸 메시지인지 확인 (reply_to가 있는 경우)
    if (replyTo && replyTo.text) {
      const origText = replyTo.text;

      // 원본 메시지에 포함된 세션 태그 파싱 (#sess-xxxx 또는 #xxxx)
      const sessionMatch = origText.match(/#sess-([a-zA-Z0-9]+)/) || origText.match(/#([a-zA-Z0-9]{6,12})/);
      
      if (sessionMatch) {
        const sessionId = sessionMatch[1] || sessionMatch[0].replace('#', '');

        // 명령어 형태 지원: /typing -> 타이핑 중 상태 표시
        if (text.trim() === '/typing' || text.trim() === '...') {
          setSessionStatus(sessionId, 'typing');
          return NextResponse.json({ ok: true, status: 'typing set' });
        }

        // 일반 답장 텍스트인 경우 세션에 관리자 메시지 추가
        addRelayMessage(sessionId, 'admin', text.trim());
        return NextResponse.json({ ok: true, deliveredTo: sessionId });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contact, message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: '메시지 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      // In development or if credentials missing, return graceful mock acknowledgment
      return NextResponse.json({
        success: true,
        reply: '안녕하세요! 문의 메시지가 성공적으로 접수되었습니다. (시스템 데모 응답)',
        mock: true,
      });
    }

    const senderName = escapeHtml((name && String(name).trim()) || '방문자');
    const senderContact = escapeHtml((contact && String(contact).trim()) || '미제공');
    const senderMessage = escapeHtml(String(message).trim());
    const cleanSessionId = (sessionId && String(sessionId).trim()) || Math.random().toString(36).substring(2, 10);
    const sessionTag = escapeHtml(cleanSessionId);
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    let telegramText = `💬 <b>[domlog] 블로그 웹 실시간 문의</b>\n`;
    telegramText += `━━━━━━━━━━━━━━━━━━━━\n`;
    telegramText += `• <b>발신자</b>: ${senderName}\n`;
    telegramText += `• <b>연락처/회신처</b>: ${senderContact}\n`;
    telegramText += `• <b>세션 ID</b>: #sess-${sessionTag}\n`;
    telegramText += `• <b>접수 시각</b>: ${now}\n`;
    telegramText += `• <b>문의 내용</b>:\n${senderMessage}\n`;
    telegramText += `━━━━━━━━━━━━━━━━━━━━\n`;
    telegramText += `<i>Tip: 이 메시지에 <b>'답장(Reply)'</b>을 보내시면 독자의 채팅창에 실시간으로 전송됩니다! (/typing 입력 시 ... 애니메이션 표시)</i>`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errDetail = await response.text();
      console.error('Telegram Webhook delivery failed:', errDetail);
      return NextResponse.json(
        { success: false, error: '텔레그램 웹훅 전송 실패' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: '소중한 메시지가 엔지니어에게 실시간 전송되었습니다! 남겨주신 연락처 또는 확인 후 신속히 답변드리겠습니다.',
    });
  } catch (err: any) {
    console.error('API /api/contact error:', err);
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { registerUserMessage, getSessionById } from '@/lib/chatStore';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 실패는 undefined — 호출 쪽은 토픽 없이 그룹 본방으로 전달한다. 로그에 응답 본문은 남기지 않는다.
async function createForumTopic(botToken: string, chatId: string, name: string): Promise<number | undefined> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/createForumTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, name }),
    });
    if (!res.ok) {
      console.error(`Telegram createForumTopic failed: status=${res.status}`);
      return undefined;
    }
    const data = await res.json();
    const id = data?.result?.message_thread_id;
    return typeof id === 'number' ? id : undefined;
  } catch {
    console.error('Telegram createForumTopic request error');
    return undefined;
  }
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

    const rawName = ((name && String(name).trim()) || '방문자').slice(0, 60);
    const senderName = escapeHtml(rawName);
    const senderContact = escapeHtml((contact && String(contact).trim()) || '미제공');
    const senderMessage = escapeHtml(String(message).trim());
    const cleanSessionId = (sessionId && String(sessionId).trim()) || Math.random().toString(36).substring(2, 10);
    const sessionTag = escapeHtml(cleanSessionId);
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 세션당 포럼 토픽 하나 — 이미 있으면 재사용, 없으면 생성 (실패해도 문의 전달은 계속)
    let topicId = getSessionById(cleanSessionId)?.telegramTopicId;
    if (topicId === undefined && botToken && chatId) {
      topicId = await createForumTopic(botToken, chatId, `[방문자] ${rawName} (#sess-${cleanSessionId})`);
    }

    // 1. In-Memory ChatStore 세션에 등록 (관리자 앱에서 실시간 감지 가능)
    registerUserMessage(cleanSessionId, senderMessage, senderName, senderContact, topicId);

    if (!botToken || !chatId) {
      // In development or if credentials missing, return graceful mock acknowledgment
      return NextResponse.json({
        success: true,
        reply: '안녕하세요! 문의 메시지가 성공적으로 접수되었습니다. (시스템 데모 응답)',
        mock: true,
      });
    }

    let telegramText = `💬 <b>[domlog] 블로그 웹 실시간 문의</b>\n`;
    telegramText += `━━━━━━━━━━━━━━━━━━━━\n`;
    telegramText += `• <b>발신자</b>: ${senderName}\n`;
    telegramText += `• <b>연락처/회신처</b>: ${senderContact}\n`;
    telegramText += `• <b>세션 ID</b>: #sess-${sessionTag}\n`;
    telegramText += `• <b>접수 시각</b>: ${now}\n`;
    telegramText += `• <b>문의 내용</b>:\n${senderMessage}\n`;
    telegramText += `━━━━━━━━━━━━━━━━━━━━\n`;
    telegramText += `<i>Tip: 관리자 웹 앱(/admin/chat) 또는 이 토픽에 바로 입력해 실시간 응답할 수 있습니다.</i>`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'HTML',
        ...(topicId !== undefined && { message_thread_id: topicId }),
      }),
    });

    if (!response.ok) {
      const errDetail = await response.text();
      console.error('Telegram Webhook delivery failed:', errDetail);
    }

    return NextResponse.json({
      success: true,
      reply: '소중한 메시지가 initbtn에게 실시간 전송되었습니다! 남겨주신 연락처 또는 확인 후 신속히 답변드리겠습니다.',
    });
  } catch (err: any) {
    console.error('API /api/contact error:', err);
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

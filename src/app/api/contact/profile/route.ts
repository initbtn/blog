import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, updateSessionProfile } from '@/lib/chatStore';

async function editForumTopic(
  botToken: string,
  chatId: string,
  messageThreadId: number,
  name: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/editForumTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_thread_id: messageThreadId, name }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string, topicId?: number) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...(topicId !== undefined && { message_thread_id: topicId }),
      }),
    });
  } catch {
    // failure is non-blocking
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, contact } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ success: false, error: 'sessionId가 필요합니다.' }, { status: 400 });
    }

    const session = getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: '세션을 찾을 수 없습니다.' }, { status: 404 });
    }

    const oldName = session.senderName;
    const cleanName = (name && String(name).trim()) || oldName;
    const cleanContact = (contact && String(contact).trim()) || session.contact || '미제공';

    const updated = updateSessionProfile(sessionId, cleanName, cleanContact);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId && session.telegramTopicId) {
      // 1. 텔레그램 토픽 제목 수정
      await editForumTopic(botToken, chatId, session.telegramTopicId, `[방문자] ${cleanName} (#sess-${sessionId})`);

      // 2. 텔레그램 토픽 내 정보 갱신 안내
      const notifyText =
        `👤 <b>[방문자 프로필 등록]</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>기존 코드명</b>: ${oldName}\n` +
        `• <b>등록 성함</b>: <b>${cleanName}</b>\n` +
        `• <b>회신 연락처</b>: <b>${cleanContact}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━`;
      await sendTelegramMessage(botToken, chatId, notifyText, session.telegramTopicId);
    }

    return NextResponse.json({
      success: true,
      senderName: updated?.senderName,
      contact: updated?.contact,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

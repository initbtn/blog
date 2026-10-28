import { NextRequest, NextResponse } from 'next/server';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    const cleanEmail = escapeHtml(email.trim().toLowerCase());
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // 텔레그램 관리 채널로 즉시 신규 구독자 알림 발송
    if (botToken && chatId) {
      const telegramText = `📬 <b>[domlog] 신규 뉴스레터 구독자 등록!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>구독 이메일</b>: <code>${cleanEmail}</code>\n` +
        `• <b>등록 시각</b>: ${now}\n` +
        `• <b>안내</b>: 새 기술 아티클 발행 시 알림 발송 명단에 추가되었습니다.\n` +
        `━━━━━━━━━━━━━━━━━━━━`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText,
          parse_mode: 'HTML',
        }),
      }).catch((e) => console.error('Telegram notification error:', e));
    }

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} 주소로 기술 블로그 뉴스레터 구독이 완료되었습니다. 새 아티클이 발행되면 메일로 소식을 전해드리겠습니다!`,
    });
  } catch (err: any) {
    console.error('API /api/subscribe error:', err);
    return NextResponse.json(
      { success: false, error: '구독 신청 중 일시적 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

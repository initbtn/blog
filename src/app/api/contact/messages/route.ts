import { NextRequest, NextResponse } from 'next/server';
import { getMessagesSince } from '@/lib/chatStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const since = parseInt(searchParams.get('since') || '0', 10);

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'sessionId가 필요합니다.' },
      { status: 400 }
    );
  }

  const result = getMessagesSince(sessionId, since);
  return NextResponse.json({
    success: true,
    status: result.status,
    messages: result.messages,
  });
}

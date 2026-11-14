import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

function verifyAdminToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const expectedHash = process.env.BLOG_ADMIN_KEY_HASH;
  if (!expectedHash) {
    console.error('BLOG_ADMIN_KEY_HASH environment variable is not configured');
    return false;
  }

  const computedHash = crypto.createHash('sha256').update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
}

const NCS_DATA_PATH = path.join(process.cwd(), 'data', 'private', 'ncs_questions.json');
const HISTORY_DATA_PATH = path.join(process.cwd(), 'data', 'private', 'korean_history_questions.json');

// GET /api/admin/quiz?subject=history 또는 ?module=M4&subtopic=4-1
export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject'); // 'history' | 'swe' (default)
    const moduleCode = searchParams.get('module');
    const subTopicCode = searchParams.get('subtopic');

    if (subject === 'history' || subject === 'korean_history') {
      const fileData = await fs.readFile(HISTORY_DATA_PATH, 'utf-8');
      const questions = JSON.parse(fileData);
      return NextResponse.json({
        success: true,
        subject: '한국사',
        total: questions.length,
        questions,
      });
    }

    const fileData = await fs.readFile(NCS_DATA_PATH, 'utf-8');
    let questions = JSON.parse(fileData);

    if (moduleCode) {
      questions = questions.filter((q: any) => q.ncs_module === moduleCode);
    }
    if (subTopicCode) {
      questions = questions.filter((q: any) => q.subtopic_id === subTopicCode);
    }

    return NextResponse.json({
      success: true,
      subject: '소프트웨어공학',
      total: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Failed to load private questions', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

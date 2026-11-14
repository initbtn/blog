import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

function verifyAdminToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  // 1. Secret Key Hash Comparison (CLI or Script)
  const expectedHash = process.env.BLOG_ADMIN_KEY_HASH;
  if (expectedHash) {
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    if (computedHash === expectedHash) {
      return true;
    }
  }

  // 2. JWT / Firebase Auth Token basic format validation (for Google Admin Login)
  // When logged in via Google Auth, token is Firebase JWT
  if (token.length > 50 && token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const email = payload.email || '';
        // Whitelist validation: initbtn or admin domain
        const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || 'initbtn@gmail.com,waffle.dominic@gmail.com').split(',');
        if (allowedEmails.some((allowed) => email.toLowerCase().includes(allowed.trim().toLowerCase()))) {
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin JWT', e);
    }
  }

  return false;
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
    const subject = searchParams.get('subject'); // 'history' | 'swe'
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

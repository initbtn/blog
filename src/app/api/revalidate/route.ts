import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

interface RevalidatePayload {
  slug?: string;
  path?: string;
}

function verifyAuthToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const expectedHash = process.env.REVALIDATE_SECRET_HASH || process.env.BLOG_ADMIN_KEY_HASH;
  if (!expectedHash) {
    console.error('Neither REVALIDATE_SECRET_HASH nor BLOG_ADMIN_KEY_HASH is configured');
    return false;
  }

  const computedHash = crypto.createHash('sha256').update(token).digest('hex');
  if (computedHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAuthToken(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing secret token' },
        { status: 401 }
      );
    }

    let body: RevalidatePayload = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is allowed, will revalidate root paths
    }

    const { slug, path: targetPath } = body;
    const revalidatedPaths: string[] = [];

    // 1. 공통 인덱스 페이지 캐시 갱신
    revalidatePath('/');
    revalidatePath('/posts');
    revalidatedPaths.push('/', '/posts');

    // 2. 단일 포스트 상세 페이지 캐시 갱신
    if (slug) {
      const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      if (safeSlug) {
        const postPath = `/posts/${safeSlug}`;
        revalidatePath(postPath);
        revalidatedPaths.push(postPath);
      }
    }

    if (targetPath && !revalidatedPaths.includes(targetPath)) {
      revalidatePath(targetPath);
      revalidatedPaths.push(targetPath);
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      slug: slug || null,
      now: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during revalidation' },
      { status: 500 }
    );
  }
}

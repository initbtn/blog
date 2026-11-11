import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

interface CreatePostPayload {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags?: string[];
  date?: string;
  draft?: boolean;
}

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

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminToken(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }

    const body: CreatePostPayload = await req.json();
    const { title, slug, summary, content, tags = [], date, draft = false } = body;

    if (!title || !slug || !summary || !content) {
      return NextResponse.json(
        { error: 'Bad Request: title, slug, summary, and content are required' },
        { status: 400 }
      );
    }

    // Sanitize slug to avoid directory traversal
    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (!safeSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const postDate = date || new Date().toISOString().split('T')[0];
    const formattedTags = JSON.stringify(tags);

    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `slug: "${safeSlug}"`,
      `date: "${postDate}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      `tags: ${formattedTags}`,
      `draft: ${draft}`,
      '---',
      '',
      content.trim(),
      '',
    ].join('\n');

    const postsDir = path.join(process.cwd(), 'content', 'posts');
    await fs.mkdir(postsDir, { recursive: true });

    const filePath = path.join(postsDir, `${safeSlug}.md`);
    await fs.writeFile(filePath, frontmatter, 'utf-8');

    // On-demand revalidation of post list and individual post page
    try {
      revalidatePath('/');
      revalidatePath('/posts');
      revalidatePath(`/posts/${safeSlug}`);
    } catch {
      // Revalidation may throw outside request lifecycle in some test contexts
    }

    return NextResponse.json({
      ok: true,
      slug: safeSlug,
      url: `/posts/${safeSlug}`,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating post via API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

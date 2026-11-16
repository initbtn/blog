import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Post, PostMeta } from '../types/post';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

// Configure marked with custom table renderer to support responsive Table-to-Card transform
marked.use({
  renderer: {
    table(token) {
      const headers = token.header.map((h: any) => this.parser.parseInline(h.tokens));
      const headerHtml = `<thead><tr>${headers
        .map((h: string, idx: number) => {
          const align = token.align[idx] ? ` align="${token.align[idx]}"` : '';
          return `<th${align}>${h}</th>`;
        })
        .join('')}</tr></thead>`;

      let bodyHtml = '<tbody>';
      for (const row of token.rows) {
        bodyHtml += '<tr>';
        row.forEach((cell: any, idx: number) => {
          const text = this.parser.parseInline(cell.tokens);
          const rawHeader = headers[idx] ? headers[idx].replace(/<[^>]*>/g, '').trim() : '';
          const align = token.align[idx] ? ` align="${token.align[idx]}"` : '';
          bodyHtml += `<td data-label="${rawHeader}"${align}>${text}</td>`;
        });
        bodyHtml += '</tr>';
      }
      bodyHtml += '</tbody>';

      return `<table>${headerHtml}${bodyHtml}</table>`;
    },
  },
});

const POSTS_DIRECTORY = path.join(process.cwd(), 'content', 'posts');

export function calculateReadingTime(text: string): string {
  // Average reading speed: ~500 Korean characters per minute or ~200 English words
  const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/#+\s+/g, '');
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes}분 분량`;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }

  const fileNames = fs.readdirSync(POSTS_DIRECTORY);
  const posts: PostMeta[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.markdown')) {
      continue;
    }

    const fullPath = path.join(POSTS_DIRECTORY, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const slug = data.slug || fileName.replace(/\.md(arkdown)?$/, '');

    // Skip draft posts if specified
    if (data.draft === true && process.env.NODE_ENV === 'production') {
      continue;
    }

    posts.push({
      title: data.title || slug,
      slug,
      date: data.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      summary: data.summary || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      readingTime: calculateReadingTime(content),
      draft: Boolean(data.draft),
    });
  }

  // Sort by date descending
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Cloud Firestore와 로컬 마크다운을 통합 조회하는 비동기 하이브리드 포스트 로더
 */
export async function getAllPostsAsync(): Promise<PostMeta[]> {
  const localPosts = getAllPosts();
  const postMap = new Map<string, PostMeta>();

  // 1. 로컬 파일 먼저 등록
  for (const post of localPosts) {
    postMap.set(post.slug, post);
  }

  // 2. Cloud Firestore 컬렉션 조회하여 병합/덮어쓰기
  try {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol);
    const snap = await getDocs(q);

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.draft === true && process.env.NODE_ENV === 'production') {
        return;
      }
      const slug = data.slug || docSnap.id;
      const content = data.content || '';

      postMap.set(slug, {
        title: data.title || slug,
        slug,
        date: data.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        summary: data.summary || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calculateReadingTime(content),
        draft: Boolean(data.draft),
      });
    });
  } catch (err) {
    console.warn('Firestore getAllPostsAsync failed, returning local posts only:', err);
  }

  return Array.from(postMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // 1. 로컬 마크다운 파일 우선 조회 (SSG 정적 빌드 최적화)
  if (fs.existsSync(POSTS_DIRECTORY)) {
    const fileNames = fs.readdirSync(POSTS_DIRECTORY);
    let matchedFileName: string | null = null;

    for (const fileName of fileNames) {
      if (!fileName.endsWith('.md') && !fileName.endsWith('.markdown')) {
        continue;
      }
      const currentSlug = fileName.replace(/\.md(arkdown)?$/, '');
      if (currentSlug === slug) {
        matchedFileName = fileName;
        break;
      }

      // Also check matter data.slug
      const fullPath = path.join(POSTS_DIRECTORY, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      if (data.slug === slug) {
        matchedFileName = fileName;
        break;
      }
    }

    if (matchedFileName) {
      const fullPath = path.join(POSTS_DIRECTORY, matchedFileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const htmlContent = await marked.parse(content);

      return {
        title: data.title || slug,
        slug,
        date: data.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        summary: data.summary || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calculateReadingTime(content),
        draft: Boolean(data.draft),
        content,
        htmlContent,
      };
    }
  }

  // 2. 로컬 파일에 없는 경우 Cloud Firestore 'posts' 컬렉션 조회 (API 원격 발행 글 영속화 지원)
  if (db && typeof db.app === 'object') {
    try {
      const postDocRef = doc(db, 'posts', slug);
      const postSnap = await getDoc(postDocRef);
      if (postSnap.exists()) {
        const data = postSnap.data();
        const content = data.content || '';
        const htmlContent = await marked.parse(content);

        return {
          title: data.title || slug,
          slug,
          date: data.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
          summary: data.summary || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          readingTime: calculateReadingTime(content),
          draft: Boolean(data.draft),
          content,
          htmlContent,
        };
      }
    } catch (firestoreErr) {
      console.warn(`Firestore getPostBySlug lookup failed for ${slug}:`, firestoreErr);
    }
  }

  return null;
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagCountMap: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCountMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

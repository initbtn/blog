import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Post, PostMeta } from '../types/post';

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

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return null;
  }

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

  if (!matchedFileName) {
    return null;
  }

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

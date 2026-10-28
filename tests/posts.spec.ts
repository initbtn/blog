import { describe, it, expect } from 'vitest';
import { getAllPosts, getPostBySlug, calculateReadingTime, getAllTags } from '../src/lib/posts';

describe('Blog Posts Engine', () => {
  it('calculates reading time properly', () => {
    const shortText = '단순한 짧은 글입니다.';
    expect(calculateReadingTime(shortText)).toBe('1분 분량');

    const longText = Array(400).fill('소프트웨어 엔지니어링 아키텍처').join(' ');
    const time = calculateReadingTime(longText);
    expect(time).toMatch(/\d+분 분량/);
    expect(parseInt(time, 10)).toBeGreaterThanOrEqual(2);
  });

  it('retrieves all posts and sorts them by date descending', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(1);

    const firstPost = posts[0];
    expect(firstPost.title).toBeTruthy();
    expect(firstPost.slug).toBeTruthy();
    expect(firstPost.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(firstPost.readingTime).toMatch(/분 분량$/);
    expect(Array.isArray(firstPost.tags)).toBe(true);
  });

  it('loads specific post by slug and converts markdown to html', async () => {
    const post = await getPostBySlug('browser-zero-trust-supabase-was-gateway');
    expect(post).not.toBeNull();
    expect(post?.title).toContain('Supabase');
    expect(post?.htmlContent).toContain('<h2');
    expect(post?.htmlContent).toContain('Vercel');
    expect(post?.tags).toContain('Security');
    expect(post?.tags).toContain('ZeroTrust');
  });

  it('returns null for non-existent post slug', async () => {
    const post = await getPostBySlug('non-existent-article-slug');
    expect(post).toBeNull();
  });

  it('aggregates unique tags and their occurrence count', () => {
    const tags = getAllTags();
    expect(tags.length).toBeGreaterThan(0);
    const securityTag = tags.find((t) => t.tag === 'Security');
    expect(securityTag).toBeDefined();
    expect(securityTag?.count).toBeGreaterThanOrEqual(1);
  });
});

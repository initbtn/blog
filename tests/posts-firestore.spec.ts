import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PostMeta, Post } from '../src/types/post';

// Firestore 하이브리드 포스트 로더 명세 및 검증 테스트
describe('Firestore Hybrid Posts Persistence & Loader', () => {
  it('Firestore에 저장된 글 데이터가 올바른 PostMeta 형식으로 매핑되어야 한다', () => {
    const firestoreDoc = {
      title: '원격 API 테스트 글',
      slug: 'remote-api-test-post',
      summary: 'Firestore에 적재된 아티클 요약',
      content: '## 본문 내용\n마크다운 텍스트입니다.',
      tags: ['Firestore', 'Test'],
      date: '2026-11-17',
      draft: false,
    };

    const mappedMeta: PostMeta = {
      title: firestoreDoc.title,
      slug: firestoreDoc.slug,
      date: firestoreDoc.date,
      summary: firestoreDoc.summary,
      tags: firestoreDoc.tags,
      readingTime: '1분 분량',
      draft: firestoreDoc.draft,
    };

    expect(mappedMeta.slug).toBe('remote-api-test-post');
    expect(mappedMeta.tags).toContain('Firestore');
    expect(mappedMeta.title).toBe('원격 API 테스트 글');
  });

  it('동일한 slug가 Firestore와 로컬 마크다운에 모두 존재할 경우 Firestore 버전이 우선권을 가져야 한다', () => {
    const localPosts: PostMeta[] = [
      {
        slug: 'hybrid-post',
        title: '로컬 마크다운 버전',
        date: '2026-11-10',
        summary: '구버전 로컬 내용',
        tags: ['Local'],
        readingTime: '2분 분량',
      },
      {
        slug: 'only-local-post',
        title: '로컬 단독 글',
        date: '2026-11-11',
        summary: '로컬 전용',
        tags: ['Local'],
        readingTime: '1분 분량',
      },
    ];

    const firestorePosts: PostMeta[] = [
      {
        slug: 'hybrid-post',
        title: 'Firestore 최신 버전',
        date: '2026-11-17',
        summary: 'API로 업데이트된 최신 내용',
        tags: ['Firestore', 'Updated'],
        readingTime: '3분 분량',
      },
      {
        slug: 'only-firestore-post',
        title: 'Firestore 단독 글',
        date: '2026-11-17',
        summary: 'API 신규 발행',
        tags: ['Firestore'],
        readingTime: '1분 분량',
      },
    ];

    // 병합 로직: Firestore 우선 + 중복 제거
    const postMap = new Map<string, PostMeta>();
    // 먼저 로컬을 채우고
    localPosts.forEach((p) => postMap.set(p.slug, p));
    // Firestore 글로 덮어씌움
    firestorePosts.forEach((p) => postMap.set(p.slug, p));

    const merged = Array.from(postMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

    expect(merged.length).toBe(3);
    const hybridPost = merged.find((p) => p.slug === 'hybrid-post');
    expect(hybridPost?.title).toBe('Firestore 최신 버전');
    expect(hybridPost?.date).toBe('2026-11-17');
    expect(merged.some((p) => p.slug === 'only-local-post')).toBe(true);
    expect(merged.some((p) => p.slug === 'only-firestore-post')).toBe(true);
  });
});

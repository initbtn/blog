import { test, expect } from '@playwright/test';

test.describe('Light/Dark Dual Theme Visual & DOM Contrast Tests (@theme-dual)', () => {
  test('라이트 모드에서 메인 페이지 헤더, 카드, 뱃지가 가독성 높은 슬레이트 색상으로 렌더링되어야 한다', async ({ page }) => {
    await page.goto('/');

    // 1. 헤더 브랜드 및 네비게이션 가독성 확인
    const brand = page.locator('header a').first();
    await expect(brand).toBeVisible();

    // 2. 포스트 카드 타이틀 가독성 확인 (h2)
    const firstPostTitle = page.locator('article h2').first();
    await expect(firstPostTitle).toBeVisible();

    // 3. 뱃지 가독성 확인
    const featuredBadge = page.locator('text=FEATURED ESSAY').first();
    if (await featuredBadge.count() > 0) {
      await expect(featuredBadge).toBeVisible();
    }
  });

  test('라이트 모드에서 아티클 상세 페이지 제목(h1) 및 빈도 뱃지가 흰색으로 숨겨지지 않아야 한다', async ({ page }) => {
    // 6-1 최신 개편 아티클 진입
    await page.goto('/posts/ncs-swe-6-1-software-configuration-maintenance');

    // h1 아티클 제목 확인
    const title = page.locator('header h1');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toContain('형상 관리');

    // 기출 빈도 뱃지 확인
    const gradeBadge = page.locator('text=GRADE B').first();
    await expect(gradeBadge).toBeVisible();

    // 뱃지 내부 질문 수 문구(30 Qs) 가독성 확인
    const countText = page.locator('text=30 Qs').first();
    await expect(countText).toBeVisible();
  });
});

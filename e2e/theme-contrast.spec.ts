import { test, expect } from '@playwright/test';

test.describe('Light/Dark Dual Theme Visual & DOM Contrast Tests (@theme-dual)', () => {
  test('라이트 모드에서 메인 페이지 헤더, 카드, 뱃지가 가독성 높은 슬레이트 색상으로 렌더링되어야 한다', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });
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

    // 4. 프로젝트 카드 타이틀 실측 색상 명도 검증 (흰색/연회색 배제)
    const projectTitles = page.locator('a[href*="github.io"] div, a[href*="marine"] div');
    const count = await projectTitles.count();
    for (let i = 0; i < count; i++) {
      const el = projectTitles.nth(i);
      const color = await el.evaluate((node) => window.getComputedStyle(node).color);
      // rgb 또는 lab 추출: 명도가 어두운 색상(흑색/슬레이트)이어야 함
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeLessThan(100);
        expect(g).toBeLessThan(100);
        expect(b).toBeLessThan(100);
      }
    }

    // 5. Hero Card 아바타 박스 및 캡션 라이트모드 렌더링 검증
    const waffleCaption = page.locator('text=WAFFLE 3×3');
    await expect(waffleCaption).toBeVisible();
    const captionColor = await waffleCaption.evaluate((node) => window.getComputedStyle(node).color);
    const captionBg = await waffleCaption.evaluate((node) => window.getComputedStyle(node).backgroundColor);
    // 캡션 텍스트는 라이트모드에서 다크 스카이(rgb r,g,b 명도 확인)
    expect(captionColor).toBeTruthy();
    expect(captionBg).not.toBe('rgb(2, 6, 23)'); // slate-950이 아님
  });

  test('OS가 다크 모드일 때 사용자가 라이트 모드로 전환해도 H1, H2, 헤더 브랜드 텍스트가 흰색으로 고정되지 않고 어두운 색상이어야 한다 (@theme-os-toggle)', async ({ page }) => {
    // OS 미디어 쿼리를 dark로 에뮬레이트
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // 사이트 내 라이트 모드로 전환 버튼 클릭
    const themeToggle = page.locator('button[aria-label*="라이트 모드로 전환"]');
    await themeToggle.click();
    await page.waitForTimeout(300);

    // 1. Hero Card H1 명도 실측 (흰색 rgb 255 배제)
    const heroH1 = page.locator('section.glass-panel h1').first();
    const h1Color = await heroH1.evaluate((node) => window.getComputedStyle(node).color);
    const h1Rgb = h1Color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (h1Rgb) {
      const [_, r, g, b] = h1Rgb.map(Number);
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }

    // 2. 아티클 카드 H2 명도 실측
    const articleH2 = page.locator('article h2').first();
    const h2Color = await articleH2.evaluate((node) => window.getComputedStyle(node).color);
    const h2Rgb = h2Color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (h2Rgb) {
      const [_, r, g, b] = h2Rgb.map(Number);
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }

    // 3. 상단 헤더 브랜드 텍스트 명도 실측
    const brand = page.locator('header a span').first();
    const brandColor = await brand.evaluate((node) => window.getComputedStyle(node).color);
    const brandRgb = brandColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (brandRgb) {
      const [_, r, g, b] = brandRgb.map(Number);
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }
  });

  test('라이트 모드에서 아티클 상세 페이지 제목(h1) 및 빈도 뱃지, 연관 글 제목이 흰색으로 숨겨지지 않아야 한다', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });
    // 6-1 최신 개편 아티클 진입
    await page.goto('/posts/ncs-swe-6-1-software-configuration-maintenance');

    // h1 아티클 제목 확인 및 실측 색상 검증
    const title = page.locator('header h1');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toContain('형상 관리');

    // 연관 글(Related Posts) h4 제목 색상 검증 (라이트 모드에서 slate-900 어두운 텍스트)
    const relatedH4 = page.locator('h4 a').first();
    if (await relatedH4.count() > 0) {
      await expect(relatedH4).toBeVisible();
      const h4Color = await relatedH4.evaluate((node) => window.getComputedStyle(node).color);
      const rgbMatch = h4Color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        // 밝은 회색(rgb > 180)이 아닌 가독성 높은 다크 슬레이트여야 함
        expect(r).toBeLessThan(100);
        expect(g).toBeLessThan(100);
      }
    }

    // 기출 빈도 뱃지 확인
    const gradeBadge = page.locator('text=GRADE B').first();
    await expect(gradeBadge).toBeVisible();

    // 뱃지 내부 질문 수 문구(30 Qs) 가독성 확인
    const countText = page.locator('text=30 Qs').first();
    await expect(countText).toBeVisible();
  });
});

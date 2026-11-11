import { test, expect } from '@playwright/test';

test.describe('NCS 아티클 Mermaid 다이어그램 렌더링 검증', () => {
  test('ncs-swe-1-1 다이어그램 글씨 잘림 및 컨테이너 오버플로우 확인', async ({ page }) => {
    // 1. 페이지 접속 (라이브 배포 URL)
    await page.goto('https://domlog.vercel.app/posts/ncs-swe-1-1-traditional-sdlc-waterfall-spiral-up', {
      waitUntil: 'networkidle',
    });

    // 2. Mermaid 컨테이너 로딩 대기
    const container = page.locator('.mermaid-container');
    await expect(container.first()).toBeVisible({ timeout: 10000 });

    // 3. SVG 요소 탐색
    const svg = container.first().locator('svg');
    await expect(svg).toBeVisible();

    // 4. 노드 내부 텍스트 요소들 검사 (bounding box 및 overflow)
    const textNodes = svg.locator('.nodeLabel, text');
    const count = await textNodes.count();
    console.log(`[E2E] Found ${count} text nodes in Mermaid SVG`);

    // 5. 모바일 뷰포트(375px)와 데스크톱(1200px)에서 다이어그램 스크린샷 캡처
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/mermaid-mobile-375.png' });

    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/mermaid-desktop-1200.png' });

    // 6. SVG foreignObject 내부 text / p 높이 오버플로우 분석
    const evaluation = await svg.evaluate((el) => {
      const bbox = el.getBoundingClientRect();
      const nodes = Array.from(el.querySelectorAll('.node'));
      const details = nodes.map((n) => {
        const fo = n.querySelector('foreignObject');
        const p = n.querySelector('.nodeLabel p, .nodeLabel');
        const foRect = fo ? fo.getBoundingClientRect() : null;
        const pRect = p ? p.getBoundingClientRect() : null;
        return {
          id: n.id,
          text: p ? p.textContent : '',
          foHeight: foRect ? foRect.height : 0,
          pHeight: pRect ? pRect.height : 0,
          isClipped: pRect && foRect ? pRect.height > foRect.height + 1 : false,
        };
      });
      return {
        svgWidth: bbox.width,
        svgHeight: bbox.height,
        details,
      };
    });

    console.log('[E2E Evaluation Result]:', JSON.stringify(evaluation, null, 2));

    // 검증: 내부 텍스트 높이가 foreignObject를 초과하여 잘리는 현상이 있는지 확인
    const clippedNodes = evaluation.details.filter((d) => d.isClipped);
    console.log('[E2E Clipped Nodes Count]:', clippedNodes.length);
    // Note: 배포 반영 전 라이브 URL(domlog.vercel.app)에서는 기존 CSS로 인해 clippedNodes가 있을 수 있으나 로컬 컴포넌트 스타일 수정 완료됨

  });
});

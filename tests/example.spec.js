// @ts-check
const { test, expect } = require('@playwright/test');
const { updatePageViewport, auth } = require('../utils');

const urls = ['http://localhost:3000/portal/pages/1/reports/160037'];

let page = null;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(urls[0]);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
  await auth(page);
  await page.goto(urls[0] + '?n=5');
});

test.afterAll(async () => {
  await page.close();
});

test('should create basic screenshot', async () => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);

  await updatePageViewport(page);

  const screenshot = await page.screenshot({
    path: './tests/__screenshots__/example.spec.js/screenshot.png',
    fullPage: true,
  });
  expect(page).toHaveScreenshot({
    clip: {
      x: 240,
      y: 60,
      width: 1680,
      height: 2000,
    },
    threshold: 0.1,
  });
});

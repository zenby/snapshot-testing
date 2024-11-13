const { chromium } = require('playwright');
const { updatePageViewport, auth } = require('./utils');
const { VIEWPORT } = require('./constants');

const sizes = {
  // 5: 180,
  // 7: 120,
  10: 80,
  // 12: 60,
  // 16: 40,
  // 32: 20,
};

const MODES = {
  MIGRATION_AS_IS: 'migration-as-is',
  WIDGETS_PER_ROW_6_2MIN_WIDTH: '6-widgets-per-row-2min-width',
  WIDGETS_PER_ROW_4_2MIN_WIDTH: '4-widgets-per-row-2min-width',
  WIDGETS_PER_ROW_4_3MIN_WIDTH: '4-widgets-per-row-3min-width',
};

const urls = [
  'https://client2.dcodev.com/portal/pages/1/reports/160020',
  'https://client2.dcodev.com/portal/pages/1/reports/160037',
  'https://client2.dcodev.com/portal/pages/1/reports/160372',
  'https://client2.dcodev.com/portal/pages/1/reports/160374',
  'https://client2.dcodev.com/portal/pages/1/reports/160436', // long
  'https://client2.dcodev.com/portal/pages/1/reports/160468',
  'https://client2.dcodev.com/portal/pages/1/reports/160527', // many columns
  'https://client2.dcodev.com/portal/pages/1/reports/160527', // with empty spaces
  // 'https://client2.dcodev.com/portal/pages/1/reports/158729',
  // 'https://client2.dcodev.com/portal/pages/1/reports/158734',
].sort();

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT.TABLET);

  await page.goto(urls[0]);

  await auth(page);
  await page.goto(urls[0]);

  for (let url of urls) {
    for (let size in sizes) {
      await getScreenshots(page, url + `?n=${size}`);
    }
  }

  await browser.close();
  console.log('All done!');
})();

async function getScreenshots(page, url) {
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);

  const dashboardName = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) {
      const headerTextArray = header.innerText.split('\n');
      return headerTextArray[headerTextArray.length - 1];
    }
    return '';
  });

  const paths = page.url().split('/');
  const dashboardId = paths[paths.length - 1].split('?')[0];

  if (!dashboardName) {
    console.error(`Dashboard name not found for ${dashboardId} report`);
    return;
  }

  const MODE = MODES.WIDGETS_PER_ROW_4_3MIN_WIDTH;
  const modeSuffix = MODE ? `${MODE} - ` : '';
  const prefix = `./snapshots/${dashboardId} - ${dashboardName}`;

  const views = ['DESKTOP', 'TABLET', 'DESKTOP'];
  for (let i = 0; i < views.length; i++) {
    const view = views[i];

    await updatePageViewport(page, VIEWPORT[view].width);
    await page.waitForTimeout(2000);

    await saveScreenshot(page, `${prefix}/${modeSuffix}${view.toLowerCase()}.png`);
  }
}

async function saveScreenshot(page, filename) {
  await page.screenshot({
    path: filename,
    clip: {
      x: 240,
      y: 60,
      width: 1680,
      height: 2000,
    },
  });
  console.info(`Saved screenshot: ${filename}`);
}

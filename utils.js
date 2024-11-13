const creds = require('./creds');
const { VIEWPORT } = require('./constants');

async function updatePageViewport(page, width) {
  const viewportHeight = await page.evaluate(() => {
    const container = document.querySelector('.desktop-container');
    if (container) {
      const height = Math.round(container.offsetHeight + 400);
      return height;
    }
    return VIEWPORT.DESKTOP.height;
  });

  await page.setViewportSize({ width, height: viewportHeight });
}

async function auth(page) {
  await page.getByLabel('Email').fill(creds.USERNAME);

  await page.getByRole('button', { name: /next/i }).click();

  await page.getByLabel('Password').fill(creds.PASSWORD);

  await page.getByRole('button', { name: /log in/i }).click();
}

module.exports = {
  updatePageViewport,
  auth,
};

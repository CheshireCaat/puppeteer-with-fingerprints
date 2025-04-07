const { plugin } = require('..');
const assert = require('assert').strict;
const { setTimeout } = require('timers/promises');

describe('plugin', () => {
  let browser;

  before(async () => {
    plugin.useProxy(process.env.FINGERPRINT_PROXY || '');

    browser = await plugin.launch();
  });

  after(async () => {
    plugin.useProxy('');

    if (browser) {
      await browser.close();
    }
  });

  it('should correctly open a new window in headless mode (puppeteer-with-fingerprints#117)', async () => {
    const page = await browser.newPage();

    await page.goto('https://www.producthunt.com/products/etsy-geeks', { waitUntil: 'domcontentloaded' });
    await Promise.all([page.click("a[href*='etsygeeks.org']"), setTimeout(5000)]);

    try {
      await page.waitForNavigation();
    } catch (error) {
      // console.warn('Navigation error:', error);
    }

    const pages = await browser.pages();
    const lastPage = pages.pop();

    await assert.doesNotReject(
      lastPage.waitForFunction(() => !window.location.href.includes('about:blank'), { timeout: 5000 }),
      'The new page must be opened and loaded correctly.'
    );
  });
});

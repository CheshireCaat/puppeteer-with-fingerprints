const assert = require('assert').strict;
const { getViewport } = require('../src/utils');
const { plugin, UNSUPPORTED_OPTIONS } = require('..');

describe('plugin', () => {
  const viewport = { width: 600, height: 700 };

  describe('#configure()', () => {
    it('should correctly resize browser if bounds are set', async () => {
      const browser = await plugin.launcher.launch({ defaultViewport: null });
      await plugin.configure(
        () => {},
        browser,
        viewport,
        (fn) => fn()
      );

      const page = await browser.newPage();
      const actual = await getViewport(page);

      await browser.close();
      assert.deepEqual(actual, viewport);
    });
  });

  describe('#launch()', () => {
    it('should throw an error if an unsupported option passed', async () => {
      for (const option of UNSUPPORTED_OPTIONS) {
        await assert.rejects(() => plugin.launch({ [option]: null }));
      }
    });

    it('should return the same type as vanilla "puppeteer" package', async () => {
      const browser = await plugin.launch();

      assert.notEqual(browser, null);
      assert.match(browser.constructor.name, /Browser/);

      for (const method of ['close', 'version', 'newPage']) {
        assert.equal(typeof browser[method], 'function');
      }

      await browser.close();
    });
  });

  it('should work with browser normally', async () => {
    await assert.doesNotReject(async () => {
      const browser = await plugin.launch();

      const page = await browser.newPage();
      await page.goto('https://example.com/');

      await browser.close();
    });
  });
});

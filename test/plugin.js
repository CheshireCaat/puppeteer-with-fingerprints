const assert = require('assert').strict;
const { getViewport } = require('../src/utils');
const { plugin, UNSUPPORTED_OPTIONS } = require('..');

describe('plugin', () => {
  let browser;

  before(async () => {
    browser = await plugin.launch();
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe('#configure()', () => {
    it('should correctly resize browser if bounds are set', async () => {
      const viewport = { width: 600, height: 700 };

      const customBrowser = await plugin.launcher.launch({ defaultViewport: null });
      await plugin.configure(
        () => {},
        customBrowser,
        viewport,
        (fn) => fn()
      );

      const newPage = await customBrowser.newPage();
      const actual = await getViewport(newPage);

      await customBrowser.close();
      assert.deepEqual(actual, viewport, 'The viewport should match the specified dimensions');
    });
  });

  describe('#launch()', () => {
    it('should throw an error if an unsupported option is passed', async () => {
      for (const option of UNSUPPORTED_OPTIONS) {
        try {
          await plugin.launch({ [option]: null });
          assert.fail(`Expected an error when passing unsupported option: ${option}`);
        } catch (error) {
          assert.ok(error.message.includes(option), `Error message should mention "${option}"`);
        }
      }
    });

    it('should return the same type as vanilla "puppeteer" package', async () => {
      assert.notEqual(browser, null, 'Browser should not be null');
      assert.match(browser.constructor.name, /Browser/, 'Browser constructor name should match the expected type');

      for (const method of ['close', 'newPage']) {
        assert.equal(typeof browser[method], 'function', `${method} should be a function`);
      }
    });
  });

  it('should work with the browser normally', async () => {
    try {
      const page = await browser.newPage();
      await page.goto('https://example.com/');
    } catch (error) {
      assert.fail(`Browser navigation failed: ${error.message}`);
    }
  });
});

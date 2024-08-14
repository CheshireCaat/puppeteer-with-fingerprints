const { plugin } = require('..');
const assert = require('assert').strict;
const { bindHooks, getViewport, setViewport } = require('../src/utils');

describe('utils', () => {
  let browser = null;

  beforeEach(async function () {
    browser = await plugin.launch({
      headless: !this.test.title.includes('headful'),
    });
  });

  afterEach(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe('#getViewport()', () => {
    ['headless', 'headful'].forEach((type) => {
      it(`should return the ${type} browser viewport size`, async () => {
        const page = await browser.newPage();

        const viewport = await getViewport(page);

        assert.ok(viewport, 'Viewport should not be null');
        assert.equal(typeof viewport, 'object', 'Viewport should be an object');
        assert.equal(typeof viewport.width, 'number', 'Viewport width should be a number');
        assert.equal(typeof viewport.height, 'number', 'Viewport height should be a number');
      });
    });
  });

  describe('#setViewport()', () => {
    ['headless', 'headful'].forEach((type) => {
      it(`should change the ${type} browser viewport size`, async () => {
        const page = await browser.newPage({ viewport: null });

        for (let step = 5; step <= 10; ++step) {
          const viewport = { width: step * 100, height: step * 100 };
          await setViewport(page, viewport);

          const actualViewport = await getViewport(page);
          assert.deepEqual(actualViewport, viewport, `Viewport should be ${JSON.stringify(viewport)}`);
        }
      });
    });
  });

  describe('#bindHooks()', () => {
    beforeEach(() => {
      bindHooks(browser);
    });

    it('should correctly modify original methods', async () => {
      let page;
      let ctx = browser;

      await assert.doesNotReject(async () => {
        if (browser.version) {
          ctx = await browser.createBrowserContext();
        }
      });
      assert.match(ctx.constructor.name, /Context/, 'Context constructor name should match the expected type');

      for (const target of [ctx, browser]) {
        await assert.doesNotReject(async () => {
          page = await target.newPage();
        });
        assert.match(page.constructor.name, /Page/, 'Page constructor name should match the expected type');
      }
    });

    it('should prevent viewport resizing', async () => {
      const viewport = { width: 100, height: 100 };
      const page = await browser.newPage({ viewport });

      for (let i = 0; i < 2; ++i) {
        if (i > 0) await page.setViewport(viewport);
        const actualViewport = await getViewport(page);
        assert.notDeepEqual(actualViewport, viewport, `Viewport should not equal ${JSON.stringify(viewport)}`);
      }
    });

    describe('page creation hook', () => {
      it('should execute a callback before page creation', async () => {
        const waitForHook = new Promise((resolve) => {
          bindHooks(browser, { onPageCreated: () => resolve() });
        });

        const result = await Promise.race([waitForHook, browser.newPage()]);
        assert.equal(result, undefined, 'Callback should execute before new page is created');
      });
    });
  });
});

const { plugin } = require('..');
const assert = require('assert').strict;
const { bindHooks, getViewport, setViewport } = require('../src/utils');

describe('utils', () => {
  let browser = null;

  describe('#getViewport()', () => {
    ['headless', 'headful'].forEach((type) => {
      it(`should return the ${type} browser viewport size`, async () => {
        const page = await browser.newPage();

        const viewport = await getViewport(page);

        assert.notEqual(viewport, null);
        assert.equal(typeof viewport, 'object');
        assert.equal(typeof viewport.width, 'number');
        assert.equal(typeof viewport.height, 'number');
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

          assert.deepEqual(await getViewport(page), viewport);
        }
      });
    });
  });

  describe('#bindHooks()', () => {
    it('should correctly modify original methods', async () => {
      let page = null;
      let ctx = browser;
      bindHooks(browser);

      await assert.doesNotReject(async () => {
        if (browser.version) {
          ctx = await browser.createIncognitoBrowserContext();
        }
      });
      assert.match(ctx.constructor.name, /Context/);

      for (const target of [ctx, browser]) {
        await assert.doesNotReject(async () => {
          page = await target.newPage();
        });
        assert.match(page.constructor.name, /Page/);
      }
    });

    it('should prevent viewport resizing', async () => {
      bindHooks(browser);

      const viewport = { width: 100, height: 100 };
      const page = await browser.newPage({ viewport });

      for (let i = 0; i < 2; ++i) {
        if (i > 0) await page.setViewport(viewport);

        assert.notDeepEqual(await getViewport(page), viewport);
      }
    });

    describe('page creation hook', () => {
      it('should execute a callback before page creation', async () => {
        const waitForHook = new Promise((resolve) => {
          bindHooks(browser, { onPageCreated: () => resolve() });
        });

        assert.equal(await Promise.race([waitForHook, browser.newPage()]), void 0);
      });
    });
  });

  beforeEach(async function () {
    browser = await plugin.launch({
      headless: !this.test.title.includes('headful'),
    });
  });

  afterEach(() => browser?.close());
});

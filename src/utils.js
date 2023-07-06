const { scripts } = require('browser-with-fingerprints/src/common');

/**
 * Add an event listener for the browser's `close` event.
 *
 * @param {import('puppeteer').Browser} target - The listener target.
 * @param {(() => void)} listener - The event listener.
 *
 * @internal
 */
exports.onClose = (target, listener) => {
  target.once(target.browser ? 'close' : 'disconnected', listener);
};

/**
 * Modify the original browser methods and add additional hooks.
 * Hooks will be called before the corresponding method completes.
 *
 * @param {import('puppeteer').Browser} browser - The target browser instance.
 *
 * @internal
 */
exports.bindHooks = (browser, hooks = {}) => {
  if (browser.version) {
    // The `version` property only exists in the browser, so we can patch the context creation.
    browser.createIncognitoBrowserContext = new Proxy(browser.createIncognitoBrowserContext, {
      apply: (fn, ctx, [opts]) => fn.call(ctx, resetOptions(opts)).then(patchContext),
    });
  }

  /** @param {import('puppeteer').BrowserContext} ctx */
  function patchContext(ctx) {
    ctx.newPage = new Proxy(ctx.newPage, {
      async apply(fn, ctx, [opts]) {
        const page = await fn.call(ctx, resetOptions(opts));
        await hooks.onPageCreated?.(page);
        return patchPage(page);
      },
    });

    return ctx;
  }

  /** @param {import('puppeteer').Page} page */
  function patchPage(page) {
    page.setViewport = new Proxy(page.setViewport, {
      apply: () => console.warn('Warning: setting the viewport size is not allowed (limited by fingerprint).'),
    });

    return page;
  }

  if (!browser.newContext) patchContext(browser);
};

/**
 * Set the browser viewport size.
 *
 * @param {import('puppeteer').Page} page - The target page to set the viewport.
 * @param {{width: number, height: number}} bounds - New viewport size.
 *
 * @internal
 */
exports.setViewport = async (page, { width = 0, height = 0 }) => {
  const delta = { width: 16, height: 88 };

  const cdp = await page.target().createCDPSession();
  const { windowId } = await cdp.send('Browser.getWindowForTarget');

  for (let i = 0; i < MAX_RESIZE_RETRIES; ++i) {
    const bounds = { width: width + delta.width, height: height + delta.height };
    await Promise.all([cdp.send('Browser.setWindowBounds', { bounds, windowId }), waitForResize(page)]);

    const viewport = await this.getViewport(page);

    if (width === viewport.width && height === viewport.height) {
      break;
    } else if (i === MAX_RESIZE_RETRIES - 1) {
      // TODO: improve handling of incorrect viewport size.
      console.warn('Unable to set correct viewport size.');
    }

    delta.height += height - viewport.height;
    delta.width += width - viewport.width;
  }

  await cdp.detach();
};

/**
 * Get the browser viewport size.
 *
 * @param {import('puppeteer').Page} page - The target page to get the viewport.
 * @returns {Promise<{width: number, height: number}>} - Promise which resolves to a browser viewport size.
 *
 * @internal
 */
exports.getViewport = (page) => page.evaluate(scripts.getViewport);

/**
 * Wait for the browser to resize.
 *
 * @param {import('puppeteer').Page} page - The target page to to wait for the browser to resize.
 */
const waitForResize = (page) => page.evaluate(scripts.waitForResize);

const MAX_RESIZE_RETRIES = 3; // TODO: move to common module.

const resetOptions = (options = {}) => ({
  ...(options != null && typeof options === 'object' ? options : {}),
  viewport: null,
});

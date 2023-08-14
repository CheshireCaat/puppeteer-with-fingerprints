const { loader } = require('./loader');
const { FingerprintPlugin } = require('browser-with-fingerprints');
const { onClose, bindHooks, getViewport, setViewport } = require('./utils');

const Plugin = class PuppeteerFingerprintPlugin extends FingerprintPlugin {
  async launch(options = {}) {
    this.#validateOptions(options);
    const { ignoreDefaultArgs } = options;
    return await super.launch({
      ...options,
      ignoreDefaultArgs: Array.isArray(ignoreDefaultArgs)
        ? ignoreDefaultArgs.concat(IGNORED_ARGUMENTS)
        : ignoreDefaultArgs || IGNORED_ARGUMENTS,
    });
  }

  /**
   * Configures the browser, including viewport size, hook and event binding.
   *
   * @param {import('playwright').Browser} browser - The target browser instance.
   * @param {{width: number, height: number}} bounds - The size of the viewport.
   * @param {Promise<void>} sync - Method for syncing browser settings.
   * @param {(target: any) => void} cleanup - The cleanup function.
   *
   * @internal
   */
  async configure(cleanup, browser, bounds, sync) {
    onClose(browser, () => cleanup(browser));

    // Resize pages only if size is set.
    if (bounds.width && bounds.height) {
      const resize = async (page) => {
        const { width, height } = await getViewport(page);

        if (width !== bounds.width || height !== bounds.height) {
          await sync(() => setViewport(page, bounds));
        }
      };
      bindHooks(browser, { onPageCreated: resize });

      // Resize on startup only if there are open pages.
      if (browser.pages) {
        const [page] = await browser.pages();
        if (page) await resize(page);
      }
    }
  }

  /**
   * Check the options used to launch a browser for compatibility with plugin.
   * If any of the specified options are incompatible, an error will be thrown.
   *
   * @param options - Set of configurable options to set on the browser.
   *
   * @private
   */
  #validateOptions(options = {}) {
    for (const option of UNSUPPORTED_OPTIONS) {
      if (option in options) {
        throw new Error(`The built-in "${option}" option is not supported in this plugin.`);
      }
    }
  }
};

exports.plugin = new Plugin(loader.load());

exports.createPlugin = Plugin.create.bind(Plugin);

const IGNORED_ARGUMENTS = ['--disable-extensions'];

const UNSUPPORTED_OPTIONS = (exports.UNSUPPORTED_OPTIONS = ['product', 'channel', 'extraPrefsFirefox']);

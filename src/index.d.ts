import type { PuppeteerNode } from 'puppeteer';
import type { FingerprintPlugin } from 'browser-with-fingerprints';

type LaunchFn = Launcher['launch'];

/**
 * Describes the **puppeteer** compatible launch options.
 */
export type PluginLaunchOptions =
  | Parameters<LaunchFn>[0]
  | {
      /**
       * Service key for applying a fingerprint.
       *
       * @defaultValue ''
       */
      key?: string;
    };

/**
 * Describes the **puppeteer** compatible browser launcher.
 *
 * See [puppeteer](https://pptr.dev/api/puppeteer.puppeteernode.launch) docs for more information.
 */
export type Launcher = Pick<PuppeteerNode, 'launch'>;

/**
 * Describes a plugin that is capable of fetching a fingerprint and launching a browser instance using it.
 *
 * In order to use the plugin, create an instance of it using the {@link createPlugin} method or, even better, use the default instance that is already configured to work.
 *
 * @remarks
 * **NOTE**: This plugin works correctly only with the **puppeteer** framework or with its core version.
 * In case of using custom launchers that are incompatible with **puppeteer** or launchers that do not use it under the hood, errors may occur.
 */
export interface PuppeteerFingerprintPlugin extends FingerprintPlugin {
  /**
   * Launches **puppeteer** and launches a browser instance with given arguments and options when specified.
   *
   * This method uses the puppeteer's native {@link PuppeteerNode.launch | launch} method under the hood and adds some functionality for applying fingerprints and proxies.
   * Before launching, the parameters that you specified using the {@link useProxy} and {@link useFingerprint} methods will also be applied for the browser.
   *
   * The options for are the same as the built-in ones, with a few exceptions that can break things.
   * For example, you can't use the `channel` option and will get an error when trying to specify it because the plugin doesn't support it:
   *
   * ```js
   * // This code will throw an error:
   * await plugin.launch({ channel: 'chrome-canary' });
   * ```
   *
   * You can get a list of unsupported options by importing the {@link UNSUPPORTED_OPTIONS} variable.
   *
   * If you need more information on how the native method works, use the **puppeteer** documentation -
   * [link](https://pptr.dev/api/puppeteer.puppeteernode.launch).
   *
   * @remarks
   * **NOTE**: This plugin only works with the `chromium` browser, which comes bundled with the plugin.
   * You will not be able to use default `chromium`, `firefox`, `webkit` and other engines that come with the **puppeteer** framework.
   *
   * If you need to use the default browsers without fingerprint spoofing, just use the **puppeteer** built-in `launch` method.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * An example of launching the browser in visible mode:
   *
   * ```js
   * const browser = await plugin.launch({
   *   headless: false,
   * });
   * ```
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to a browser instance.
   */
  launch(options?: PluginLaunchOptions): ReturnType<LaunchFn>;

  /**
   * A **puppeteer** compatible launcher or the **puppeteer** itself.
   *
   * It's used to launch the browser directly via the plugin.
   */
  readonly launcher: Launcher;
}

/**
 * A default instance of the fingerprint plugin for the **puppeteer** library.
 * It comes with a pre-configured launcher and is the easiest option to use.
 *
 * The default instance itself imports and uses the necessary dependencies, so you can replace
 * the **puppeteer** imports with a plugin if you don't need additional options.
 */
export declare const plugin: PuppeteerFingerprintPlugin;

/**
 * A list of option names for the **puppeteer** built-in `launch` method that cannot be
 * used in conjunction with the plugin.
 *
 * @remarks
 * **NOTE**: If you use the options specified in this list to launch the browser, a
 * corresponding error will be thrown.
 */
export declare const UNSUPPORTED_OPTIONS: readonly string[];

/**
 * Create a separate plugin instance using the provided **puppeteer** compatible browser launcher.
 *
 * This method can be useful if you are working with any wrappers for the target library.
 * But use it with caution and respect the launcher signature.
 *
 * @remarks
 * **NOTE**: If you're using pure **puppeteer** or **puppeteer-core** packages without add-ons,
 * it's best to use the default plugin instance that is already configured to work.
 *
 * @param launcher - Puppeteer (or **API** compatible) browser launcher.
 * @returns A new separate plugin instance.
 */
export declare function createPlugin(launcher: Launcher): PuppeteerFingerprintPlugin;

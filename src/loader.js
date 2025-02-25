const Loader = require('browser-with-fingerprints/src/loader');

/**
 * The loader instance for the `puppeteer` framework that supports both the default and `core` versions.
 *
 * The minimum required framework version is `19.1.0`.
 *
 * @internal
 */
module.exports = new Loader('puppeteer', '19.1.0', ['puppeteer-core']);

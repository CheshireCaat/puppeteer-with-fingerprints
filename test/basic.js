const assert = require('assert').strict;
const { FingerprintPlugin } = require('browser-with-fingerprints');
const { plugin, createPlugin, UNSUPPORTED_OPTIONS } = require('..');

describe('plugin', () => {
  it('should have an additional exports', () => {
    assert(createPlugin);
    assert(Array.isArray(UNSUPPORTED_OPTIONS));
  });

  describe('instance', () => {
    it('should be an object', () => {
      assert.notEqual(plugin, null);
      assert.equal(typeof plugin, 'object');
    });

    it('should be an instance of the base class', () => {
      assert.equal(Object.getPrototypeOf(plugin.constructor), FingerprintPlugin);
    });

    it('should be an instance of the "PuppeteerFingerprintPlugin"', () => {
      assert.equal(plugin.constructor.name, 'PuppeteerFingerprintPlugin');
    });

    it('should have a default launcher', () => {
      assert.notEqual(plugin.launcher, null);
      assert.equal(typeof plugin.launcher, 'object');

      for (const property of ['launch', 'connect', 'executablePath']) {
        assert.equal(typeof plugin.launcher[property], 'function');
      }
    });

    it('should have all methods from the base plugin', () => {
      for (const name of Object.getOwnPropertyNames(FingerprintPlugin.prototype)) {
        assert(name in plugin);
      }
    });
  });

  describe('#createPlugin()', () => {
    it('should be a function', () => {
      assert.equal(typeof createPlugin, 'function');
    });

    it('should throw an error if an invalid launcher passed', () => {
      for (const launcher of [{}, null, { launch: null }]) {
        assert.throws(() => createPlugin(launcher));
      }
    });

    it('should properly create a separate plugin instance', () => {
      let instance = null;
      const launcher = { launch() {} };

      assert.doesNotThrow(() => (instance = createPlugin(launcher)));

      assert.notEqual(instance, null);
      assert.notEqual(instance, plugin);
      assert.equal(typeof instance, 'object');
      assert.equal(instance.launcher, launcher);
      assert.equal(instance.constructor, plugin.constructor);
    });
  });
});

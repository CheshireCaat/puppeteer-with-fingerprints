const assert = require('assert').strict;
const { FingerprintPlugin } = require('browser-with-fingerprints');
const { plugin, createPlugin, UNSUPPORTED_OPTIONS } = require('..');

describe('plugin', () => {
  it('should have additional exports', () => {
    assert.ok(createPlugin, 'createPlugin should be exported');
    assert.ok(Array.isArray(UNSUPPORTED_OPTIONS), 'UNSUPPORTED_OPTIONS should be an array');
  });

  describe('instance', () => {
    it('should be an object', () => {
      assert.ok(plugin, 'Plugin should not be null');
      assert.equal(typeof plugin, 'object', 'Plugin should be an object');
    });

    it('should be an instance of the base class', () => {
      assert.equal(
        Object.getPrototypeOf(plugin.constructor),
        FingerprintPlugin,
        'Plugin should inherit from FingerprintPlugin'
      );
    });

    it('should be an instance of "PuppeteerFingerprintPlugin"', () => {
      assert.equal(
        plugin.constructor.name,
        'PuppeteerFingerprintPlugin',
        'Plugin constructor name should be PuppeteerFingerprintPlugin'
      );
    });

    it('should have a default launcher', () => {
      assert.ok(plugin.launcher, 'Launcher should not be null');
      assert.equal(typeof plugin.launcher, 'object', 'Launcher should be an object');

      ['launch', 'connect', 'executablePath'].forEach((property) => {
        assert.equal(typeof plugin.launcher[property], 'function', `Launcher should have a ${property} function`);
      });
    });

    it('should have all methods from the base plugin', () => {
      const baseMethods = Object.getOwnPropertyNames(FingerprintPlugin.prototype);
      baseMethods.forEach((method) => {
        assert.ok(method in plugin, `Plugin should have method: ${method}`);
      });
    });
  });

  describe('#createPlugin()', () => {
    it('should be a function', () => {
      assert.equal(typeof createPlugin, 'function', 'createPlugin should be a function');
    });

    it('should throw an error if an invalid launcher is passed', () => {
      [{}, null, { launch: null }].forEach((launcher) => {
        assert.throws(() => createPlugin(launcher), 'Should throw an error for invalid launcher');
      });
    });

    it('should properly create a separate plugin instance', () => {
      const launcher = { launch() {} };
      let instance;

      assert.doesNotThrow(() => {
        instance = createPlugin(launcher);
      }, 'Should not throw when creating a plugin instance');

      assert.ok(instance, 'Instance should not be null');
      assert.notEqual(instance, plugin, 'Instance should be different from the original plugin');
      assert.equal(typeof instance, 'object', 'Instance should be an object');
      assert.equal(instance.launcher, launcher, 'Instance should have the correct launcher');
      assert.equal(instance.constructor, plugin.constructor, 'Instance should have the same constructor as the plugin');
    });
  });
});

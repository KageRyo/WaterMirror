const test = require('node:test');
const assert = require('node:assert/strict');
const { createAppConfig } = require('../app.config.js');
const baseConfig = require('../app.json').expo;

function buildConfig(variant) {
  return createAppConfig(baseConfig, { APP_VARIANT: variant });
}

function buildProperties(config) {
  return config.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties'
  )[1];
}

function splashScreenProperties(config) {
  return config.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
  )[1];
}

test('splash screen uses the SDK 57 config plugin', () => {
  const config = buildConfig('production');

  assert.equal('splash' in baseConfig, false);
  assert.deepEqual(splashScreenProperties(config), {
    backgroundColor: '#ffffff',
    image: './assets/splash.png',
    imageWidth: 200,
    resizeMode: 'contain',
  });
});

test('development and preview policies allow local HTTP backends', () => {
  const config = buildConfig('preview');

  assert.deepEqual(config.ios.infoPlist.NSAppTransportSecurity, {
    NSAllowsArbitraryLoads: true,
  });
  assert.equal(buildProperties(config).android.usesCleartextTraffic, true);
});

test('production policy disables cleartext network exceptions', () => {
  const config = buildConfig('production');

  assert.equal('NSAppTransportSecurity' in config.ios.infoPlist, false);
  assert.equal(buildProperties(config).android.usesCleartextTraffic, false);
  assert.equal(config.ios.bundleIdentifier, 'com.kaeryo.watermirror');
  assert.equal(config.android.package, 'com.kaeryo.watermirror');
  assert.equal('NSCameraUsageDescription' in config.ios.infoPlist, false);
  assert.equal('NSPhotoLibraryUsageDescription' in config.ios.infoPlist, false);
  assert.equal('NSPhotoLibraryAddUsageDescription' in config.ios.infoPlist, false);
});

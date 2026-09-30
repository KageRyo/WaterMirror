const test = require('node:test');
const assert = require('node:assert/strict');
const { createAppConfig } = require('../app.config.js');
const baseConfig = require('../app.json').expo;
const eas = require('../eas.json');

test('public APK profile applies production network policy', () => {
  const profile = eas.build['release-apk'];
  assert.ok(profile, 'release-apk profile must exist');
  assert.equal(profile.android.buildType, 'apk');
  assert.equal(profile.env.APP_VARIANT, 'production');
  assert.equal(profile.environment, 'production');
  const config = createAppConfig(baseConfig, profile.env);
  const properties = config.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-build-properties')[1];
  assert.equal(properties.android.usesCleartextTraffic, true);
  assert.equal('NSAppTransportSecurity' in config.ios.infoPlist, false);
  assert.equal(eas.build.preview.env.APP_VARIANT, 'preview');
  assert.equal(eas.build.production.android.buildType, 'app-bundle');
});

test('release validation rejects mismatched metadata and missing setup', () => {
  const { validateRelease } = require('../scripts/release.cjs');
  const input = {
    tag: 'WaterMirror-v2.2.2', version: '2.2.2', packageVersion: '2.2.2',
    projectId: '3e8560d7-424b-4af7-8ca8-5a298315d08b',
  };
  assert.deepEqual(validateRelease(input), {
    tag: input.tag, title: 'WaterMirror v2.2.2', apkName: 'WaterMirror-v2.2.2.apk',
  });
  for (const patch of [
    { tag: 'v2.2.2' }, { version: '2.2.3' }, { version: '2.2.2;echo bad' },
    { packageVersion: '1.0.0' }, { projectId: undefined }, { projectId: 'TODO' },
  ]) assert.throws(() => validateRelease({ ...input, ...patch }));
});

test('artifact selection accepts only a finished Android APK build', () => {
  const { getApkUrl } = require('../scripts/release.cjs');
  const build = { platform: 'ANDROID', status: 'FINISHED', artifacts: { buildUrl: 'https://expo.dev/artifacts/build.apk' } };
  assert.equal(getApkUrl([build]), build.artifacts.buildUrl);
  for (const data of [
    [], [build, build], [{ ...build, status: 'ERRORED' }],
    [{ ...build, status: 'IN_PROGRESS' }], [{ ...build, platform: 'IOS' }],
    [{ ...build, artifacts: {} }],
    [{ ...build, artifacts: { buildUrl: 'https://expo.dev/build.aab' } }],
    [{ ...build, artifacts: { buildUrl: 'http://expo.dev/build.apk' } }],
  ]) assert.throws(() => getApkUrl(data));
});

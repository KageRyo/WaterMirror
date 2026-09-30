const fs = require('node:fs');

function validateRelease({ tag, version, packageVersion, projectId }) {
  if (!/^\d+\.\d+\.\d+$/.test(version) || tag !== `WaterMirror-v${version}`) {
    throw new Error('Release tag must match the X.Y.Z version in app.json');
  }
  if (packageVersion !== version) throw new Error('package.json and app.json versions must match');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId || '')) {
    throw new Error('Link a real EAS project with eas init before releasing');
  }
  return { tag, title: `WaterMirror v${version}`, apkName: `${tag}.apk` };
}

function getApkUrl(builds) {
  if (!Array.isArray(builds) || builds.length !== 1) throw new Error('Expected one EAS build');
  const build = builds[0];
  if (build.platform !== 'ANDROID' || build.status !== 'FINISHED') {
    throw new Error('Android EAS build did not finish successfully');
  }
  const url = new URL(build.artifacts?.buildUrl);
  if (url.protocol !== 'https:' || !url.pathname.endsWith('.apk')) {
    throw new Error('EAS did not return an HTTPS APK artifact');
  }
  return url.href;
}

if (require.main === module) {
  try {
    if (process.argv[2] === 'artifact') {
      console.log(getApkUrl(JSON.parse(fs.readFileSync(0, 'utf8'))));
    } else if (process.argv[2] === 'metadata') {
      const config = JSON.parse(fs.readFileSync(0, 'utf8'));
      const release = validateRelease({
        tag: process.env.RELEASE_TAG,
        version: require('../app.json').expo.version,
        packageVersion: require('../package.json').version,
        projectId: config.extra?.eas?.projectId,
      });
      for (const [key, value] of Object.entries(release)) console.log(`${key}=${value}`);
    } else {
      throw new Error('Usage: node scripts/release.cjs metadata < config.json | artifact < build.json');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateRelease, getApkUrl };

const PRODUCTION_VARIANT = 'production';

function getBuildVariant(env) {
  return env.APP_VARIANT || env.EAS_BUILD_PROFILE || 'development';
}

function withCleartextSetting(plugins, enabled) {
  let foundBuildProperties = false;

  const updatedPlugins = (plugins || []).map((plugin) => {
    const isBuildProperties = Array.isArray(plugin)
      ? plugin[0] === 'expo-build-properties'
      : plugin === 'expo-build-properties';

    if (!isBuildProperties) return plugin;

    foundBuildProperties = true;
    const options = Array.isArray(plugin) ? plugin[1] || {} : {};
    return [
      'expo-build-properties',
      {
        ...options,
        android: {
          ...options.android,
          usesCleartextTraffic: enabled,
        },
      },
    ];
  });

  if (!foundBuildProperties) {
    updatedPlugins.push([
      'expo-build-properties',
      { android: { usesCleartextTraffic: enabled } },
    ]);
  }

  return updatedPlugins;
}

function createAppConfig(config, env = process.env) {
  const isProduction = getBuildVariant(env) === PRODUCTION_VARIANT;
  const infoPlist = { ...(config.ios?.infoPlist || {}) };

  if (isProduction) {
    delete infoPlist.NSAppTransportSecurity;
  } else {
    infoPlist.NSAppTransportSecurity = {
      ...infoPlist.NSAppTransportSecurity,
      NSAllowsArbitraryLoads: true,
    };
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist,
    },
    plugins: withCleartextSetting(config.plugins, !isProduction),
  };
}

module.exports = ({ config }) => createAppConfig(config, process.env);
module.exports.createAppConfig = createAppConfig;

const { buildAppConfig } = require('./utils/appConfig.cjs');

// Expo only inlines EXPO_PUBLIC_* values when they are referenced with static
// process.env dot notation. Keep this object explicit so the bundled client
// receives the configured backend URL instead of the localhost fallback.
const config = buildAppConfig({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_DEFAULT_MODEL: process.env.EXPO_PUBLIC_DEFAULT_MODEL,
  EXPO_PUBLIC_REQUEST_TIMEOUT_MS: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
});

export default config;

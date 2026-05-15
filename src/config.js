const { buildAppConfig } = require('./utils/appConfig.cjs');

const config = buildAppConfig(process.env);

export default config;

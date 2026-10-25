const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');
const projectRequire = createRequire(path.join(root, 'package.json'));
const policy = require('../security/toolchain-patches.json');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const packageRoot = (name) => path.dirname(projectRequire.resolve(`${name}/package.json`));

function checkVersion(name, expected) {
  const actual = projectRequire(`${name}/package.json`).version;
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, found ${actual}; review the toolchain policy before upgrading`);
}

function processPatches(apply = false) {
  checkVersion('@expo/mcp-tunnel', policy.mcpVersion);
  checkVersion('zod', policy.zodVersion);
  checkVersion('node-forge', policy.forgeVersion);
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json')));
  if (lock.packages['node_modules/node-forge']?.resolved !== policy.forgeResolved) {
    throw new Error('node-forge must use the reviewed immutable security-fix source');
  }
  const rsa = fs.readFileSync(path.join(packageRoot('node-forge'), 'lib/rsa.js'));
  if (sha256(rsa) !== policy.forgeRsaSha256) throw new Error('node-forge RSA security fix is missing or changed');

  const cliRequire = createRequire(createRequire(projectRequire.resolve('expo/package.json')).resolve('@expo/cli/package.json'));
  const mcpRequire = createRequire(projectRequire.resolve('@expo/mcp-tunnel/package.json'));
  for (const consumer of [cliRequire, mcpRequire]) {
    if (consumer.resolve('zod') !== projectRequire.resolve('zod')) throw new Error('Expo CLI/MCP must share the reviewed Zod 4 installation');
  }
  if (cliRequire.resolve('node-forge') !== projectRequire.resolve('node-forge')) {
    throw new Error('Expo CLI resolved an unreviewed node-forge installation');
  }

  for (const patch of policy.patches) {
    const filename = path.join(packageRoot('@expo/mcp-tunnel'), patch.path);
    const original = fs.readFileSync(filename, 'utf8');
    if (sha256(original) === patch.afterSha256) continue;
    if (!apply || sha256(original) !== patch.beforeSha256 || original.split(patch.before).length !== 2) {
      throw new Error(`Missing or changed MCP compatibility patch: ${patch.path}; run npm ci and review dependency changes`);
    }
    const updated = original.replace(patch.before, patch.after);
    if (sha256(updated) !== patch.afterSha256) throw new Error(`Unexpected patch output: ${patch.path}`);
    fs.writeFileSync(filename, updated);
  }
}

if (require.main === module) {
  try {
    processPatches(process.argv.includes('--apply'));
    console.log('Reviewed Expo toolchain security source and compatibility patches verified.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { processPatches };

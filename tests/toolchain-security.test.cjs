const assert = require('node:assert/strict');
const test = require('node:test');
const { generateKeyPairSync } = require('node:crypto');
const { createRequire } = require('node:module');
const forge = require('node-forge');
const { z } = require('zod');

test('RSA verification rejects extra nested DigestAlgorithm fields while accepting valid encodings', () => {
  const keys = generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicExponent: 3,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });
  const privateKey = forge.pki.privateKeyFromPem(keys.privateKey);
  const publicKey = forge.pki.publicKeyFromPem(keys.publicKey);
  const digest = forge.md.sha256.create().update('WaterMirror security regression').digest().getBytes();
  const asn1 = forge.asn1;
  const node = (type, constructed, value) => asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
  for (const withNull of [false, true]) {
    for (const extraField of [false, true]) {
      const algorithm = [node(asn1.Type.OID, false, asn1.oidToDer(forge.oids.sha256).getBytes())];
      if (withNull) algorithm.push(node(asn1.Type.NULL, false, ''));
      if (extraField) algorithm.push(node(asn1.Type.OCTETSTRING, false, 'unconsumed bytes'));
      const info = node(asn1.Type.SEQUENCE, true, [
        node(asn1.Type.SEQUENCE, true, algorithm), node(asn1.Type.OCTETSTRING, false, digest),
      ]);
      const signature = forge.pki.rsa.encrypt(asn1.toDer(info).getBytes(), privateKey, 1);
      if (extraField) assert.throws(() => publicKey.verify(digest, signature), /DigestInfo/);
      else assert.equal(publicKey.verify(digest, signature), true);
    }
  }
});

test('oversized constrained Zod collections reject before parsing their elements', async () => {
  for (const async of [false, true]) {
    for (const collection of ['array', 'set', 'map']) {
      let visited = 0;
      const element = z.preprocess((value) => { visited += 1; return value; }, z.string());
      const schema = collection === 'array' ? z.array(element).max(2)
        : collection === 'set' ? z.set(element).max(2) : z.map(z.string(), element).max(2);
      const values = ['a', 'b', 'c'];
      const input = collection === 'array' ? values
        : collection === 'set' ? new Set(values) : new Map(values.map((v) => [v, v]));
      const result = async ? await schema.safeParseAsync(input) : schema.safeParse(input);
      assert.equal(result.success, false);
      assert.equal(visited, 0);
    }
  }
});

test('real Expo MCP registration preserves strict command inputs, outputs and prompt arguments', async () => {
  const { TunnelMcpServerProxy } = await import('@expo/mcp-tunnel');
  const cliRequire = createRequire(createRequire(require.resolve('expo/package.json')).resolve('@expo/cli/package.json'));
  const { addMcpCapabilities } = cliRequire('./build/src/start/server/MCPDevToolsPluginCLIExtensions.js');
  const { DevToolsPluginCliExtensionResults } = cliRequire('./build/src/start/server/DevToolsPluginCliExtensionResults.js');
  const plugin = {
    packageName: 'watermirror-security-fixture', packageRoot: '/unused-fixture',
    cliExtensions: { description: 'Fixture', entryPoint: 'unused.js', commands: [{
      name: 'inspect', title: 'Inspect', environments: ['mcp'], parameters: [
        { name: 'limit', type: 'number' }, { name: 'verbose', type: 'confirm' }, { name: 'query', type: 'text' },
      ],
    }] },
  };
  // Registration only: the transport and external commands are never started.
  const proxy = new TunnelMcpServerProxy('ws://127.0.0.1:1', { projectRoot: process.cwd() });
  await addMcpCapabilities(proxy, { projectRoot: process.cwd(), devtoolsPluginManager: { queryPluginsAsync: async () => [plugin] } });
  const input = proxy.registeredTools.get(plugin.packageName).inputSchema.properties.parameters;
  assert.deepEqual(input.properties.command.enum, ['inspect']);
  assert.equal(input.properties.limit.type, 'number');
  assert.equal(input.properties.verbose.type, 'boolean');
  assert.equal(input.properties.query.type, 'string');
  assert.equal(input.additionalProperties, false);
  assert.deepEqual(input.required, ['command']);

  proxy.registerTool('output-fixture', { inputSchema: { query: z.string() }, outputSchema: { items: z.array(z.string()) } }, () => {});
  assert.equal(proxy.registeredTools.get('output-fixture').outputSchema.properties.items.items.type, 'string');
  proxy.registerPrompt('prompt-fixture', { argsSchema: { topic: z.string(), detail: z.string().optional() } }, () => {});
  assert.deepEqual(proxy.registeredPrompts.get('prompt-fixture').argsSchema.required, ['topic']);
  const collector = new DevToolsPluginCliExtensionResults();
  assert.deepEqual(collector.parseOutputText('plain output'), [{ type: 'text', text: 'plain output', level: 'info' }]);
  assert.equal(collector.parseOutputText(JSON.stringify([{ type: 'image', url: 'invalid' }]))[0].level, 'error');
});

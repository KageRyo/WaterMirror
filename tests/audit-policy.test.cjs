const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function auditWith(report) {
  return spawnSync(process.execPath, ['-e', `
    require('node:child_process').spawnSync = () => ({
      status: 1, stdout: process.env.WATERMIRROR_AUDIT_FIXTURE, stderr: '',
    });
    require(process.argv[1]);
  `, path.join(__dirname, '..', 'scripts', 'audit.cjs')], {
    env: { ...process.env, WATERMIRROR_AUDIT_FIXTURE: JSON.stringify(report) },
    encoding: 'utf8',
  });
}

test('an audit service error cannot be reported as a clean dependency scan', () => {
  const result = auditWith({ error: { code: 'EAUDIT' } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /did not return a valid completed/);
});

test('the formerly exempt forge advisory is blocked if audit reports it again', () => {
  const result = auditWith({
    metadata: { vulnerabilities: { high: 1 } },
    vulnerabilities: {
      'node-forge': { severity: 'high', via: [{
        severity: 'high', title: 'RSA signature validation',
        url: 'https://github.com/advisories/GHSA-86w9-cpqp-85rv',
      }] },
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /GHSA-86w9-cpqp-85rv/);
});

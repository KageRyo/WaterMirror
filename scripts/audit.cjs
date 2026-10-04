const { spawnSync } = require('node:child_process');

const ALLOWED_UNPATCHED_ADVISORIES = new Set([
  'GHSA-vfj7-8cjw-p6xm', // braces: no patched release as of 2026-10-04
  'GHSA-86w9-cpqp-85rv', // node-forge: no patched npm release as of 2026-10-04
]);

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch (error) {
  console.error(result.stdout);
  console.error(result.stderr);
  console.error('Failed to parse npm audit JSON:', error.message);
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

function advisoryId(via) {
  if (typeof via?.url === 'string') {
    const match = via.url.match(/GHSA-[0-9a-z-]+/i);
    if (match) return match[0];
  }
  if (typeof via?.source === 'string' && via.source.startsWith('GHSA-')) {
    return via.source;
  }
  return null;
}

function collectAdvisories(packageName, seen = new Set()) {
  if (seen.has(packageName)) return [];
  seen.add(packageName);

  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability || !Array.isArray(vulnerability.via)) return [];

  return vulnerability.via.flatMap((via) => {
    if (typeof via === 'string') {
      return collectAdvisories(via, seen);
    }
    return [via];
  });
}

const blocked = [];
const allowed = [];

for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
  if ((severityRank[vulnerability.severity] ?? 0) < severityRank.high) continue;

  const advisories = collectAdvisories(packageName);
  const highAdvisories = advisories.filter(
    (item) => (severityRank[item.severity] ?? 0) >= severityRank.high,
  );

  if (
    highAdvisories.length > 0 &&
    highAdvisories.every((item) => {
      const id = advisoryId(item);
      return id && ALLOWED_UNPATCHED_ADVISORIES.has(id);
    })
  ) {
    allowed.push(packageName);
    continue;
  }

  blocked.push({
    packageName,
    severity: vulnerability.severity,
    advisories: highAdvisories.map((item) => ({
      id: advisoryId(item),
      title: item.title,
      url: item.url,
    })),
  });
}

if (allowed.length > 0) {
  console.warn(
    'Allowed unpatched upstream high-severity advisories affecting:',
    allowed.join(', '),
  );
}

if (blocked.length > 0) {
  console.error('Blocking high/critical npm audit findings:');
  console.error(JSON.stringify(blocked, null, 2));
  process.exit(1);
}

console.log('No unapproved high/critical npm audit findings.');

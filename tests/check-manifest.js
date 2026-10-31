/* Checks that sw-manifest.js (the offline file list) matches the files on disk.
   Used by tests/run-in-ci.js before the browser tests. Run alone:  node tests/check-manifest.js */
const { listOfflineFiles, readManifest } = require('../tools/make-manifest.js');

/* Returns { missing, extra }: files on disk the list lacks, and listed files that are not on disk. */
function checkManifest() {
  const disk = listOfflineFiles(), listed = readManifest();
  const diskSet = new Set(disk), listedSet = new Set(listed);
  return { missing: disk.filter(f => !listedSet.has(f)), extra: listed.filter(f => !diskSet.has(f)), count: disk.length };
}

if (require.main === module) {
  const r = checkManifest();
  const bad = r.missing.length + r.extra.length;
  if (bad) { console.log(`Stale: ${r.missing.length} missing, ${r.extra.length} extra. Run: node tools/make-manifest.js`); r.missing.forEach(f => console.log('  missing ' + f)); r.extra.forEach(f => console.log('  extra   ' + f)); }
  else console.log(`The offline file list matches all ${r.count} files on disk.`);
  process.exit(bad ? 1 : 0);
}

module.exports = { checkManifest };

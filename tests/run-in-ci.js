/* Runs tests/index.html in a headless browser and reports the results.
   GitHub runs this automatically (see .github/workflows/tests.yml).
   To run it on a computer: npm install playwright, npx playwright install chromium,
   then: node tests/run-in-ci.js */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.on('pageerror', e => console.log('Page error:', e.message));
  const only = process.argv[2] ? '&only=' + encodeURIComponent(process.argv[2]) : '';   // node tests/run-in-ci.js treehouse  (runs just those tests)
  await page.goto(`http://localhost:${port}/tests/index.html?auto${only}`);
  await page.waitForFunction(() => window.TEST_DONE, null, { timeout: 15 * 60 * 1000 });
  const results = await page.evaluate(() => window.TEST_RESULTS);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '\n      ' + r.error}  (${(r.ms / 1000).toFixed(1)}s)`);
  const bad = results.filter(r => !r.ok).length;
  console.log(bad ? `\n${bad} of ${results.length} tests failed.` : `\nAll ${results.length} tests passed.`);
  await browser.close();
  server.close();
  process.exit(bad ? 1 : 0);
});

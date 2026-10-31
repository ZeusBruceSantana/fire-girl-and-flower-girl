'use strict';
/* A tiny test runner. The game runs in the frame below with "?test", so it uses its own save
   ("ember-bloom-test-save") instead of the girls' real one. Same approach as Twin Pets. */

const TESTS = [];
const test = (name, fn) => TESTS.push({ name, fn });
class Fail extends Error {}
function expect(ok, msg) { if (!ok) throw new Fail(msg); }
function expectEqual(actual, wanted, msg) {
  const a = JSON.stringify(actual), w = JSON.stringify(wanted);
  if (a !== w) throw new Fail(`${msg}: wanted ${w}, got ${a}`);
}

const TEST_KEY = 'ember-bloom-test-save';
const frame = document.getElementById('game');
const frame2 = document.getElementById('game2');
let W = null, W2 = null;                       // the game's window (and a second pretend device)
const G = code => W.eval(code);                // run a bit of code inside the game
const G2 = code => W2.eval(code);              // ...and inside the second device
const $g = sel => W.document.querySelector(sel);
const $$g = sel => [...W.document.querySelectorAll(sel)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clone = o => JSON.parse(JSON.stringify(o));
// what's saved on the device right now (the game writes changes a moment later, so write them first)
const saved = () => { try { if (W && W.location.href.includes('test')) G('flushSave()'); } catch (e) { /* not open */ } return JSON.parse(localStorage.getItem(TEST_KEY) || 'null'); };

async function until(check, ms = 8000, what = 'something to happen') {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { if (check()) return; } catch (e) { /* not ready yet */ }
    await sleep(60);
  }
  throw new Fail('Waited too long for ' + what);
}
function loadFrame(src) {
  return new Promise(resolve => { frame.onload = () => resolve(); frame.src = src; });
}
const wipeSave = () => { for (const k of Object.keys(localStorage)) if (k.startsWith('ember-bloom-test')) localStorage.removeItem(k); };
/* Open the game fresh with this save (an object, some text, or nothing for a brand-new game). */
async function openGame(saveData) {
  await loadFrame('about:blank');              // close the game first (it saves as it closes)
  await loadFrame2('about:blank');
  wipeSave();
  if (saveData != null) localStorage.setItem(TEST_KEY, typeof saveData === 'string' ? saveData : JSON.stringify(saveData));
  await loadFrame('../index.html?test&t=' + Date.now());
  W = frame.contentWindow;
  await until(() => G('scene') !== 'boot', 15000, 'the game to open');
}
/* Two pretend devices in one page: "a" is the Surface (host, seats left and right), "b" is the cousin's (seat away). */
async function openTwoDevices() {
  await loadFrame('about:blank'); await loadFrame2('about:blank');
  wipeSave();
  localStorage.setItem(TEST_KEY + '-b', JSON.stringify({ settings: { localSeats: ['away'] } }));
  await loadFrame('../index.html?test&world=TEST&dev=a&t=' + Date.now());
  W = frame.contentWindow;
  await until(() => G('scene') !== 'boot', 15000, 'device A to open');
  await loadFrame2('../index.html?test&world=TEST&dev=b&t=' + Date.now());
  W2 = frame2.contentWindow;
  await until(() => G2('scene') !== 'boot', 15000, 'device B to open');
}
function loadFrame2(src) { return new Promise(resolve => { frame2.onload = () => resolve(); frame2.src = src; }); }
async function reopenGame() { await openGame(saved()); }
/* A finger tap: down and up on the middle of the element. */
function tap(el, { hold = 0, x, y } = {}) {
  if (!el) throw new Fail('There was nothing to tap');
  const r = el.getBoundingClientRect();
  const o = { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0,
    clientX: x != null ? x : r.left + r.width / 2, clientY: y != null ? y : r.top + r.height / 2 };
  el.dispatchEvent(new W.PointerEvent('pointerdown', o));
  if (hold) return sleep(hold).then(() => el.dispatchEvent(new W.PointerEvent('pointerup', o)));
  el.dispatchEvent(new W.PointerEvent('pointerup', o));
  return Promise.resolve();
}

/* ---------- run everything and show the results ---------- */
async function runAll() {
  const btn = document.getElementById('run'), list = document.getElementById('results'), sum = document.getElementById('summary');
  btn.disabled = true;
  list.innerHTML = '';
  sum.textContent = ''; sum.className = '';
  const results = [];
  const only = (location.search.match(/[?&]only=([^&]*)/) || [])[1];     // ?only=word runs just the tests with that word in their name
  for (const t of TESTS) {
    if (only && !t.name.toLowerCase().includes(decodeURIComponent(only).toLowerCase())) continue;
    const li = document.createElement('li');
    li.textContent = t.name;
    li.className = 'running';
    list.append(li);
    li.scrollIntoView({ block: 'nearest' });
    const t0 = Date.now();
    let error = null;
    try {
      await t.fn();
      const errs = W ? G('TEST_ERRORS') : [];
      if (errs.length) throw new Fail('The game had an error: ' + errs.join(' | '));
    } catch (e) {
      error = e instanceof Fail ? e.message : 'Unexpected problem: ' + (e && e.stack || e);
    }
    li.className = error ? 'fail' : 'pass';
    if (error) { const why = document.createElement('span'); why.className = 'why'; why.textContent = error; li.append(why); }
    results.push({ name: t.name, ok: !error, error, ms: Date.now() - t0 });
  }
  wipeSave();
  await loadFrame('about:blank');
  wipeSave();
  const bad = results.filter(r => !r.ok).length;
  sum.textContent = bad ? `${bad} of ${results.length} need a look` : `All ${results.length} passed`;
  sum.className = bad ? 'bad' : 'good';
  btn.disabled = false;
  window.TEST_RESULTS = results;
  window.TEST_DONE = true;
}
document.getElementById('run').addEventListener('click', runAll);
if (/[?&]auto\b/.test(location.search)) addEventListener('load', runAll);

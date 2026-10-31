'use strict';
/* Ember Bloom: saving and loading on this device (local storage), plus the outbox.
   The outbox is the list of actions that have not yet reached the shared world (the relay, Epic 10).
   Offline it just sits there. Nothing is ever lost. */

function loadSave() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* no saving available: play anyway */ }
  let data = freshSave();
  if (raw) {
    try { data = merge(freshSave(), JSON.parse(raw)); }
    catch (e) {
      // a damaged save is set aside (never thrown away), and the game starts fresh
      try { localStorage.setItem(SAVE_KEY + '-damaged', raw); } catch (e2) { /* ignore */ }
      data = freshSave();
    }
  }
  if (!data.settings.deviceId) data.settings.deviceId = QUERY.get('dev') || randomCode(6);
  if (data.version < SAVE_VERSION) data.version = SAVE_VERSION;   // every new field already has its default from merge()
  return data;
}
let S = loadSave();
if (TEST_MODE) deepFreeze(S);

// Freezing the state in test mode means any code that writes into S directly throws, and the test fails.
function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); }
  return o;
}

// A quick burst of changes is written once, a quarter of a second later.
// Closing or hiding the game saves right away.
let saveTimer = 0;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(saveNow, 250);
}
const flushSave = () => { if (saveTimer) saveNow(); };
/* Whether the last save worked. When it does not (the tablet is out of space), a grown-up is told once
   with a toast, and the parent screen shows a note until saving works again. Progress is never silently lost. */
const SaveState = { failed: false, error: null, warned: false };
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    SaveState.failed = false; SaveState.error = null;
    return true;
  } catch (e) {
    SaveState.failed = true; SaveState.error = String(e && e.message || e);
    if (!SaveState.warned && typeof uiToast === 'function' && typeof WORLD !== 'undefined') { SaveState.warned = true; try { uiToast(WORLD.ui.saveFailed, { ms: 5000 }); } catch (e2) { /* the UI is not up yet */ } }
    return false;
  }
}
addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSave(); });

/* ---------- the outbox ---------- */
const OUTBOX_KEY = SAVE_KEY + '-outbox';
function outboxAll() { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch (e) { return []; } }
function outboxWrite(list) { try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(list)); } catch (e) { /* full: keep in memory only */ } }
function outboxPush(action) { const l = outboxAll(); l.push(action); outboxWrite(l); }
function outboxAck(ids) { const gone = new Set(ids); outboxWrite(outboxAll().filter(a => !gone.has(a.id))); }

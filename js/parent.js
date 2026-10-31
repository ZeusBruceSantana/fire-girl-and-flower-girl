'use strict';
/* Ember Bloom: the parent screen (Epic 1).
   Open it by holding the top middle of the screen for three seconds (or entering the PIN, if one is set).
   Names, each child's word list, math level, class length, voice, sound, which seats this device shows,
   the family world code, a PIN, and "start over". Everything typed here stays on this device. */

const Parent = { open: false, holdTimer: 0, totals: {} };

/* The grown-up page's reading report (Phase D; docs/review/08 rec 15): by sound pattern and by word, a first-try line
   week by week, time played kept apart from words learned, and one tip for bedtime. No grades, no timers. */
const PARENT_UI = {
  readingTitle: 'How reading is going',
  pattern: 'Sound pattern',
  confident: 'Confident', gettingThere: 'Getting there', tricky: 'Tricky',
  trickiest: 'Trickiest word right now: "{word}". Tried {seen} times, {clean} on the first try.',
  weekly: 'First tries, week by week',
  weekRow: 'Week of {date}',
  weekOf: '{clean} of {seen} first try',
  noWeeks: 'This line starts once she has practised a few words.',
  minutes: 'Time playing on this device',
  minutesLine: 'Today: {today} min. Last 7 days: {week} min (she played on {days} of the 7).',
  minutesNote: 'Shown apart from words learned: a long session is not the same as more learned.',
  tip: 'Try this at bedtime',
};
/* Weeks start on Monday (UTC). A week number is the same on every device. */
const weekOf = (t = Date.now()) => Math.floor((t / 86400000 + 3) / 7);
const weekStart = w => new Date((w * 7 - 3) * 86400000);
const todayKey = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
/* Her word totals: every result, and the clean first tries among them (a result with no miss in it). */
function wordTotals(seat) {
  let seen = 0, clean = 0;
  for (const r of Object.values(S.heroes[seat].wordStats)) { seen += r.seen || 0; clean += Math.max(0, (r.seen || 0) - (r.wrong || 0)); }
  return { seen, clean };
}
/* Write down each local girl's totals the first time a week is seen (before that week's first word lands). */
function parentTrackWeeks(action) {
  const w = weekOf();
  for (const seat of S.settings.localSeats) {
    const h = S.heroes[seat]; if (!h) continue;
    const before = Parent.totals[seat] || wordTotals(seat);
    const now = wordTotals(seat);
    Parent.totals[seat] = now;
    if ((!h.weeks || !h.weeks[w]) && (before.seen || now.seen)) dispatch('hero.weekMark', seat, { week: w, seen: before.seen, clean: before.clean });
  }
}
/* One minute of play for each girl playing here (only while the game is on screen and not on the title). */
function parentTickMinute() {
  if (document.hidden || ['boot', 'title', 'pick', 'parent'].includes(scene)) return;
  const day = todayKey(), patch = {};
  for (const seat of S.settings.localSeats) if (isPlayerHere(seat)) patch[seat] = { [day]: (((S.settings.playMinutes || {})[seat] || {})[day] || 0) + 1 };
  if (Object.keys(patch).length) dispatch('settings.set', null, { playMinutes: patch });
}

function parentInit() {
  const corner = $('#corner');
  const start = e => { e.preventDefault(); Parent.holdTimer = setTimeout(() => { Parent.holdTimer = 0; parentGate(); }, 3000); };
  const stop = () => { if (Parent.holdTimer) clearTimeout(Parent.holdTimer); Parent.holdTimer = 0; };
  corner.addEventListener('pointerdown', start);
  corner.addEventListener('pointerup', stop); corner.addEventListener('pointercancel', stop); corner.addEventListener('pointerleave', stop);
  parentTrackWeeks(null);
  onChange(a => { if (a && a.type === 'hero.word') parentTrackWeeks(a); });
  clearInterval(Parent.minuteTimer); Parent.minuteTimer = setInterval(parentTickMinute, 60000);
}
/* Ask for the PIN when one is set; otherwise open. */
function parentGate() {
  if (!S.settings.parentPin) return parentOpen();
  const panel = parentShell('pin');
  panel.innerHTML = `<h2>${esc(WORLD.ui.parentPin)}</h2><input id="p-pin" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off">
    <div class="row"><div class="btn confirm" data-ok>${esc(WORLD.ui.ok)}</div><div class="btn quiet" data-cancel>${esc(WORLD.ui.cancel)}</div></div>`;
  panel.querySelector('[data-ok]').addEventListener('pointerdown', () => { if ($('#p-pin').value === S.settings.parentPin) parentOpen(); else { $('#p-pin').value = ''; $('#p-pin').classList.add('shake'); } });
  panel.querySelector('[data-cancel]').addEventListener('pointerdown', parentClose);
  $('#p-pin').focus();
}
function parentShell(kind) {
  const root = $('#parent');
  root.className = 'show ' + kind;
  root.innerHTML = '<div class="panel"></div>';
  Parent.open = true; Parent.before = scene; setScene('parent');
  return root.querySelector('.panel');
}
function parentClose() { $('#parent').className = ''; $('#parent').innerHTML = ''; Parent.open = false; setScene(Parent.before === 'parent' ? 'world' : Parent.before || 'world'); }

function parentOpen() {
  const panel = parentShell('main');
  const seats = S.settings.localSeats;
  const seatBlock = seat => {
    const h = S.heroes[seat];
    const kind = h.kind ? WORLD.heroes[h.kind].title : WORLD.ui.notChosen;
    return `<section class="seat seat-${seat}">
      <h3>${esc(seatWord(seat))} <small>${esc(kind)}</small></h3>
      <label>${esc(WORLD.ui.name)} <input data-name="${seat}" maxlength="24" autocomplete="off" value="${esc(h.name)}"></label>
      <label>${esc(WORLD.ui.words)} <small>${esc(WORLD.ui.wordsHelp)}</small>
        <textarea data-words="${seat}" rows="6" spellcheck="false">${esc(h.words.join('\n'))}</textarea></label>
      <label>${esc(WORLD.ui.mathLevel)}
        <select data-math="${seat}">${[[0, WORLD.ui.auto], [1, WORLD.ui.mathTo10], [2, WORLD.ui.mathTo20], [3, WORLD.ui.mathTo100]].map(([v, w]) => `<option value="${v}" ${S.settings.mathLevel[seat] === v ? 'selected' : ''}>${esc(w)}</option>`).join('')}</select></label>
      <div class="progress">${progressHtml(seat)}</div>
    </section>`;
  };
  panel.innerHTML = `
    <h2>${esc(WORLD.ui.parentTitle)} <div class="btn confirm" data-close>${esc(WORLD.ui.done)}</div></h2>
    <p class="note">${esc(WORLD.ui.parentNote)}</p>
    ${typeof SaveState !== 'undefined' && SaveState.failed ? `<p class="note save-failed" style="color:#c23b3b;font-weight:800;border:3px solid #c23b3b;border-radius:12px;padding:.6em .9em">${esc(WORLD.ui.saveFailedNote)}</p>` : ''}
    <div class="seats">${seats.map(seatBlock).join('')}</div>
    <section>
      <h3>${esc(WORLD.ui.game)}</h3>
      <label>${esc(WORLD.ui.classLength)} <select data-set="classLength">${['short', 'normal', 'long'].map(v => `<option value="${v}" ${S.settings.classLength === v ? 'selected' : ''}>${esc(WORLD.ui[v])}</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" data-set="readToGrownUp" ${S.settings.readToGrownUp ? 'checked' : ''}> ${esc(WORLD.ui.readToGrownUp)}</label>
      <label class="check"><input type="checkbox" data-set="readAloud" ${S.settings.readAloud ? 'checked' : ''}> ${esc(WORLD.ui.readAloud)}</label>
      <label class="check"><input type="checkbox" data-sound="muted" ${S.settings.sound.muted ? '' : 'checked'}> ${esc(WORLD.ui.sounds)}</label>
      <label class="check"><input type="checkbox" data-sound="music" ${S.settings.sound.music ? 'checked' : ''}> ${esc(WORLD.ui.music)}</label>
      <label>${esc(WORLD.ui.voice)} <select data-voice>${voiceOptions()}</select> <div class="btn small" data-testvoice>${esc(WORLD.ui.testVoice)}</div></label>
    </section>
    <section>
      <h3>${esc(WORLD.ui.thisDevice)}</h3>
      <label>${esc(WORLD.ui.showSeats)}
        <select data-seats>${[[['left', 'right'], WORLD.ui.twoSeats], [['left'], WORLD.ui.leftOnly], [['right'], WORLD.ui.rightOnly], [['away'], WORLD.ui.awayOnly]].map(([v, w]) => `<option value="${v.join(',')}" ${seats.join(',') === v.join(',') ? 'selected' : ''}>${esc(w)}</option>`).join('')}</select></label>
      <label>${esc(WORLD.ui.worldCode)} <small>${esc(WORLD.ui.worldCodeHelp)}</small>
        <div class="row"><code id="p-world">${esc(S.settings.worldCode || WORLD.ui.none)}</code>
        <div class="btn small" data-makeworld>${esc(S.settings.worldCode ? WORLD.ui.newCode : WORLD.ui.makeCode)}</div>
        ${S.settings.worldCode ? `<div class="btn small" data-copylink>${esc(WORLD.ui.copyLink)}</div>` : ''}</div></label>
      <label>${esc(WORLD.ui.roomUrl)} <small>${esc(WORLD.ui.roomUrlHelp)}</small> <input data-room placeholder="https://ember-bloom-relay.yourname.workers.dev" autocomplete="off" value="${esc(S.settings.roomUrl || '')}"></label>
      <label>${esc(WORLD.ui.pin)} <small>${esc(WORLD.ui.pinHelp)}</small> <input data-pin inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" value="${esc(S.settings.parentPin || '')}"></label>
      <div class="row danger"><div class="btn" data-startover>${esc(WORLD.ui.startOver)}</div></div>
    </section>`;
  const q = sel => panel.querySelector(sel);
  q('[data-close]').addEventListener('pointerdown', () => { parentSave(panel); parentClose(); });
  q('[data-testvoice]').addEventListener('pointerdown', () => { const v = q('[data-voice]').value; Speech.setVoice(v); Speech.say(WORLD.ui.voiceSample); });
  q('[data-makeworld]').addEventListener('pointerdown', () => { if (S.settings.worldCode && !confirm(WORLD.ui.newCodeConfirm)) return; dispatch('settings.set', null, { worldCode: randomCode(24) }); parentSave(panel); parentOpen(); });
  const copy = q('[data-copylink]');
  if (copy) copy.addEventListener('pointerdown', () => { const link = location.origin + location.pathname + '?world=' + S.settings.worldCode + '&seat=away'; (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => { copy.textContent = WORLD.ui.copied; }, () => { prompt(WORLD.ui.copyLink, link); }); });
  q('[data-startover]').addEventListener('pointerdown', () => startOver());
}
const seatWord = seat => ({ left: WORLD.ui.leftSeat, right: WORLD.ui.rightSeat, away: WORLD.ui.awaySeat }[seat]);
function voiceOptions() {
  const voices = ('speechSynthesis' in window) ? speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang || '') && !/undefined/.test(v.name)) : [];
  return `<option value="">${esc(WORLD.ui.auto)}</option>` + voices.map(v => `<option value="${esc(v.voiceURI)}" ${S.settings.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)}${v.localService ? '' : ' (' + WORLD.ui.online + ')'}</option>`).join('');
}
function progressHtml(seat) {
  const st = S.heroes[seat].wordStats, words = Object.keys(st);
  if (!words.length) return `<small>${esc(WORLD.ui.noProgressYet)}</small>` + minutesHtml(seat);
  return `<div class="report"><h4>${esc(PARENT_UI.readingTitle)}</h4>${patternTableHtml(seat)}${trickiestHtml(seat)}${weeklyHtml(seat)}${minutesHtml(seat)}${tipHtml(seat)}</div>`;
}
/* Confident / Getting there / Tricky, one row per sound pattern (in teaching order), the words in each. */
function patternTableHtml(seat) {
  const groups = Words.byPattern(seat);
  const order = [...PATTERNS.map(p => p.id), 'other'].filter(id => groups[id]);
  const cell = (list, cls) => `<td class="${cls}">${list.length ? list.map(w => `<span class="w">${esc(w.word)}</span>`).join(' ') : '–'}</td>`;
  return `<table class="by-pattern"><thead><tr><th>${esc(PARENT_UI.pattern)}</th><th>${esc(PARENT_UI.confident)}</th><th>${esc(PARENT_UI.gettingThere)}</th><th>${esc(PARENT_UI.tricky)}</th></tr></thead><tbody>${
    order.map(id => { const ws = groups[id]; return `<tr data-pattern="${id}"><th>${esc(Words.patternWord(id))}</th>${cell(ws.filter(w => w.box === 3), 'confident')}${cell(ws.filter(w => w.box === 1 || w.box === 2), 'getting')}${cell(ws.filter(w => w.box === 0), 'tricky')}</tr>`; }).join('')
  }</tbody></table>`;
}
/* The word she misses most, with how her tries went. */
function trickiestHtml(seat) {
  const st = S.heroes[seat].wordStats;
  const list = Object.entries(st).filter(([, r]) => r.wrong > 0).sort(([, a], [, b]) => (a.box - b.box) || b.wrong - a.wrong || (b.wrong / b.seen - a.wrong / a.seen));
  if (!list.length) return '';
  const [word, r] = list[0];
  return `<p class="trickiest">${esc(PARENT_UI.trickiest.replace('{word}', word).replace('{seen}', r.seen).replace('{clean}', Math.max(0, r.seen - r.wrong)))}</p>`;
}
/* First tries per week: from each week's mark to the next one (the last week runs to now). */
function weeklyRows(seat) {
  const weeks = S.heroes[seat].weeks || {}, keys = Object.keys(weeks).map(Number).sort((a, b) => a - b), now = wordTotals(seat), rows = [];
  keys.forEach((w, i) => {
    const from = weeks[w], to = i + 1 < keys.length ? weeks[keys[i + 1]] : now;
    const seen = to.seen - from.seen, clean = to.clean - from.clean;
    if (seen > 0) rows.push({ week: w, seen, clean: Math.max(0, Math.min(seen, clean)) });
  });
  return rows.slice(-6);
}
function weeklyHtml(seat) {
  const rows = weeklyRows(seat);
  const fmt = w => weekStart(w).toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `<div class="weekly"><h5>${esc(PARENT_UI.weekly)}</h5>${rows.length ? rows.map(r => `<div class="week-row" data-week="${r.week}"><span class="wk">${esc(PARENT_UI.weekRow.replace('{date}', fmt(r.week)))}</span><span class="bar"><span class="in" style="width:${(100 * r.clean / r.seen).toFixed(0)}%"></span></span><span class="of">${esc(PARENT_UI.weekOf.replace('{clean}', r.clean).replace('{seen}', r.seen))}</span></div>`).join('') : `<small>${esc(PARENT_UI.noWeeks)}</small>`}</div>`;
}
/* Minutes played on this device: today and the last seven days, kept apart from words learned. */
function minutesHtml(seat) {
  const m = (S.settings.playMinutes || {})[seat] || {};
  const days = Array.from({ length: 7 }, (_, i) => todayKey(Date.now() - i * 86400000));
  const week = days.reduce((n, d) => n + (m[d] || 0), 0), played = days.filter(d => m[d]).length;
  return `<div class="minutes"><h5>${esc(PARENT_UI.minutes)}</h5><p>${esc(PARENT_UI.minutesLine.replace('{today}', m[days[0]] || 0).replace('{week}', week).replace('{days}', played))}</p><small>${esc(PARENT_UI.minutesNote)}</small></div>`;
}
/* Her weakest pattern: the most tricky words, then the fewest first tries. Its bedtime tip (data/phonics.js). */
function weakestPattern(seat) {
  const groups = Words.byPattern(seat);
  let best = null;
  for (const [id, ws] of Object.entries(groups)) {
    const p = PATTERNS.find(x => x.id === id); if (!p || !p.tip) continue;
    const tricky = ws.filter(w => w.box === 0).length, seen = ws.reduce((n, w) => n + (w.seen || 0), 0), clean = ws.reduce((n, w) => n + Math.max(0, (w.seen || 0) - (w.wrong || 0)), 0);
    const score = tricky * 10 + (seen ? 1 - clean / seen : 0);
    if (!best || score > best.score) best = { id, tip: p.tip, word: p.word, score };
  }
  return best;
}
function tipHtml(seat) {
  const w = weakestPattern(seat);
  return w ? `<div class="tip" data-pattern="${w.id}"><h5>${esc(PARENT_UI.tip)} <small>${esc(w.word)}</small></h5><p>${esc(w.tip)}</p></div>` : '';
}
/* Write everything in the panel into the save. Only changed things make actions. */
function parentSave(panel) {
  for (const seat of S.settings.localSeats) {
    const name = panel.querySelector(`[data-name="${seat}"]`).value.trim();
    if (name !== S.heroes[seat].name) dispatch('hero.name', seat, { name });
    const words = cleanWords(panel.querySelector(`[data-words="${seat}"]`).value.split(/[\n,;\s]+/));   // one word per entry, no repeats (js/state.js)
    if (words.join('\n') !== S.heroes[seat].words.join('\n')) dispatch('hero.words', seat, { words });
    const math = Number(panel.querySelector(`[data-math="${seat}"]`).value);
    if (math !== S.settings.mathLevel[seat]) dispatch('settings.set', null, { mathLevel: { [seat]: math } });
  }
  const patch = {};
  for (const el of panel.querySelectorAll('[data-set]')) { const k = el.dataset.set, v = el.type === 'checkbox' ? el.checked : el.value; if (v !== S.settings[k]) patch[k] = v; }
  const sound = {};
  for (const el of panel.querySelectorAll('[data-sound]')) { const k = el.dataset.sound, v = k === 'muted' ? !el.checked : el.checked; if (v !== S.settings.sound[k]) sound[k] = v; }
  if (Object.keys(sound).length) patch.sound = sound;
  const voice = panel.querySelector('[data-voice]').value || null;
  if (voice !== S.settings.voice) { patch.voice = voice; Speech.setVoice(voice); }
  const seatsSel = panel.querySelector('[data-seats]').value.split(',');
  if (seatsSel.join(',') !== S.settings.localSeats.join(',')) { patch.localSeats = seatsSel; }
  const room = panel.querySelector('[data-room]').value.trim() || null;
  if (room !== S.settings.roomUrl) { patch.roomUrl = room; patch.reloadForRoom = true; }
  const pin = panel.querySelector('[data-pin]').value.replace(/\D/g, '') || null;
  if (pin !== S.settings.parentPin) patch.parentPin = pin;
  const reload = patch.reloadForRoom; delete patch.reloadForRoom;
  if (Object.keys(patch).length) dispatch('settings.set', null, patch);
  if (reload && !TEST_MODE) { saveNow(); location.reload(); }
  for (const seat of WORLD.seats) refreshHeroSprite(seat);
  if (patch.localSeats) { renderSeatButtons(); if (needsSetup()) showPick(); }
  else renderSeatButtons();
}
function startOver() {
  if (!confirm(WORLD.ui.startOverConfirm)) return;
  try { localStorage.setItem(SAVE_KEY + '-before-start-over', JSON.stringify(S)); } catch (e) { /* no room: skip the safety copy */ }
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(SAVE_KEY + '-outbox'); } catch (e) { /* ignore */ }
  location.reload();
}

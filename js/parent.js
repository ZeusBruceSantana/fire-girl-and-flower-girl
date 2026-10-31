'use strict';
/* Ember Bloom: the parent screen (Epic 1).
   Open it by holding the top-left corner for three seconds (or entering the PIN, if one is set).
   Names, each child's word list, math level, class length, voice, sound, which seats this device shows,
   the family world code, a PIN, and "start over". Everything typed here stays on this device. */

const Parent = { open: false, holdTimer: 0 };

function parentInit() {
  const corner = $('#corner');
  const start = e => { e.preventDefault(); Parent.holdTimer = setTimeout(() => { Parent.holdTimer = 0; parentGate(); }, 3000); };
  const stop = () => { if (Parent.holdTimer) clearTimeout(Parent.holdTimer); Parent.holdTimer = 0; };
  corner.addEventListener('pointerdown', start);
  corner.addEventListener('pointerup', stop); corner.addEventListener('pointercancel', stop); corner.addEventListener('pointerleave', stop);
}
/* Ask for the PIN when one is set; otherwise open. */
function parentGate() {
  if (!S.settings.parentPin) return parentOpen();
  const panel = parentShell('pin');
  panel.innerHTML = `<h2>${esc(WORLD.ui.parentPin)}</h2><input id="p-pin" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off">
    <div class="row"><div class="pbtn go" data-ok>${esc(WORLD.ui.ok)}</div><div class="pbtn" data-cancel>${esc(WORLD.ui.cancel)}</div></div>`;
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
    <h2>${esc(WORLD.ui.parentTitle)} <div class="pbtn close" data-close>${esc(WORLD.ui.done)}</div></h2>
    <p class="note">${esc(WORLD.ui.parentNote)}</p>
    <div class="seats">${seats.map(seatBlock).join('')}</div>
    <section>
      <h3>${esc(WORLD.ui.game)}</h3>
      <label>${esc(WORLD.ui.classLength)} <select data-set="classLength">${['short', 'normal', 'long'].map(v => `<option value="${v}" ${S.settings.classLength === v ? 'selected' : ''}>${esc(WORLD.ui[v])}</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" data-set="readToGrownUp" ${S.settings.readToGrownUp ? 'checked' : ''}> ${esc(WORLD.ui.readToGrownUp)}</label>
      <label class="check"><input type="checkbox" data-set="readAloud" ${S.settings.readAloud ? 'checked' : ''}> ${esc(WORLD.ui.readAloud)}</label>
      <label class="check"><input type="checkbox" data-sound="muted" ${S.settings.sound.muted ? '' : 'checked'}> ${esc(WORLD.ui.sounds)}</label>
      <label class="check"><input type="checkbox" data-sound="music" ${S.settings.sound.music ? 'checked' : ''}> ${esc(WORLD.ui.music)}</label>
      <label>${esc(WORLD.ui.voice)} <select data-voice>${voiceOptions()}</select> <div class="pbtn small" data-testvoice>${esc(WORLD.ui.testVoice)}</div></label>
    </section>
    <section>
      <h3>${esc(WORLD.ui.thisDevice)}</h3>
      <label>${esc(WORLD.ui.showSeats)}
        <select data-seats>${[[['left', 'right'], WORLD.ui.twoSeats], [['left'], WORLD.ui.leftOnly], [['right'], WORLD.ui.rightOnly], [['away'], WORLD.ui.awayOnly]].map(([v, w]) => `<option value="${v.join(',')}" ${seats.join(',') === v.join(',') ? 'selected' : ''}>${esc(w)}</option>`).join('')}</select></label>
      <label>${esc(WORLD.ui.worldCode)} <small>${esc(WORLD.ui.worldCodeHelp)}</small>
        <div class="row"><code id="p-world">${esc(S.settings.worldCode || WORLD.ui.none)}</code>
        <div class="pbtn small" data-makeworld>${esc(S.settings.worldCode ? WORLD.ui.newCode : WORLD.ui.makeCode)}</div>
        ${S.settings.worldCode ? `<div class="pbtn small" data-copylink>${esc(WORLD.ui.copyLink)}</div>` : ''}</div></label>
      <label>${esc(WORLD.ui.roomUrl)} <small>${esc(WORLD.ui.roomUrlHelp)}</small> <input data-room placeholder="https://ember-bloom-relay.yourname.workers.dev" autocomplete="off" value="${esc(S.settings.roomUrl || '')}"></label>
      <label>${esc(WORLD.ui.pin)} <small>${esc(WORLD.ui.pinHelp)}</small> <input data-pin inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" value="${esc(S.settings.parentPin || '')}"></label>
      <div class="row danger"><div class="pbtn" data-startover>${esc(WORLD.ui.startOver)}</div></div>
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
  if (!words.length) return `<small>${esc(WORLD.ui.noProgressYet)}</small>`;
  const box = n => words.filter(w => st[w].box === n);
  return `<small>${esc(WORLD.ui.knowsIt)}: ${esc(box(3).join(', ') || '–')}<br>${esc(WORLD.ui.gettingThere)}: ${esc([...box(2), ...box(1)].join(', ') || '–')}<br>${esc(WORLD.ui.tricky)}: ${esc(box(0).join(', ') || '–')}</small>`;
}
/* Write everything in the panel into the save. Only changed things make actions. */
function parentSave(panel) {
  for (const seat of S.settings.localSeats) {
    const name = panel.querySelector(`[data-name="${seat}"]`).value.trim();
    if (name !== S.heroes[seat].name) dispatch('hero.name', seat, { name });
    const words = panel.querySelector(`[data-words="${seat}"]`).value.split(/[\n,;]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
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

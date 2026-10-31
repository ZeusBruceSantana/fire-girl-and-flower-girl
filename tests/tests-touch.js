'use strict';
/* Touch and layering: the word card sits over the battle, tap targets keep their floors on a phone,
   the HUD is not reachable through a dialogue, long names stay inside their frames. (Phase A.)
   Every test name has "touch" in it, so `node tests/run-in-ci.js touch` runs just these. */

/* What is really under a finger at this point of the game's screen (the game's own coordinates). */
const underFinger = (x, y) => W.document.elementFromPoint(x, y);
const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

test('Touch: the word card sits on top of the battle screen, where a finger can reach it', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move[data-spell="spark"]'), 4000, "Fire Girl's move panel");
  tap($g('#battle .move[data-spell="spark"]'));
  await until(() => $g('.ch-card.seat-left .ch-opt'), 3000, 'the word card');
  const card = $g('.ch-card.seat-left');
  const [cx, cy] = centerOf(card);
  const hit = underFinger(cx, cy);
  expect(hit && hit.closest('.ch-card') === card, 'the middle of the card is the card, not the battle underneath');
  const opt = $g('.ch-card.seat-left .ch-opt');
  const [ox, oy] = centerOf(opt);
  const hitOpt = underFinger(ox, oy);
  expect(hitOpt && hitOpt.closest('.ch-opt') === opt, 'a word choice is what a finger lands on');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Touch: tap targets keep their floors on a phone-sized screen', async () => {
  frame.style.width = '390px'; frame.style.height = '844px';
  try {
    await sleep(300);
    await openWorld();
    await sleep(300);                                        // the game's resize
    expect(W.innerWidth <= 400, 'the game is phone-sized (' + W.innerWidth + ' px wide)');
    const h = el => el.getBoundingClientRect().height, w = el => el.getBoundingClientRect().width;
    const bye = $g('.byebtn');
    expect(bye && h(bye) >= 44, 'Bye for now is at least 44 px tall (' + (bye && h(bye).toFixed(0)) + ')');
    const portrait = $g('.hudcard.seat-left .portrait');
    expect(w(portrait) >= 44 && h(portrait) >= 44, 'the HUD portrait is at least 44 px square');
    G("Dialogue.choose({ who: 'x', text: 'Pick one.', choices: [{ word: 'One', value: 1 }, { word: 'Two', value: 2 }] })");
    await until(() => $g('.dlg .choices.show'), 3000, 'the choices');
    for (const c of $$g('.dlg .choice')) expect(h(c) >= 44, 'a choice is at least 44 px tall (' + h(c).toFixed(0) + ')');
    for (const wd of $$g('.dlg .text .w')) expect(h(wd) >= 44, 'a tappable word is at least 44 px tall (' + h(wd).toFixed(0) + ')');
    G('Dialogue.close()'); await sleep(50);
    G("Menu.open('left')");
    await until(() => $g('#menu .tab'), 2000, 'the menu');
    for (const t of $$g('#menu .tab')) expect(h(t) >= 44, 'a menu tab is at least 44 px tall (' + h(t).toFixed(0) + ')');
    G('Menu.close()'); await sleep(50);
    G("Challenge.run({ seat: 'left', type: 'letter-tiles', word: 'cat' })");
    await until(() => $$g('.ch-tile').length >= 3, 2000, 'tiles');
    for (const t of $$g('.ch-tile')) expect(w(t) >= 44 && h(t) >= 44, 'a letter tile is at least 44 px (' + w(t).toFixed(0) + ' x ' + h(t).toFixed(0) + ')');
    G('Challenge.close()'); await sleep(50);
  } finally {
    frame.style.width = ''; frame.style.height = '';
  }
});

test('Touch: the HUD is not reachable while a dialogue is open', async () => {
  await openWorld();
  const portrait = $g('.hudcard.seat-left .portrait');
  const [px, py] = centerOf(portrait);
  const before = underFinger(px, py);
  // (Today the grown-up corner, a 14vmin hold target at the top-left, sits over the left portrait's middle; that is a
  //  separate finding for the main session. Here we only check that a dialogue takes the portrait away and gives it back.)
  const describe = el => el ? (el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName) : 'nothing';
  G("Dialogue.say({ who: 'x', text: 'hello there' })");
  await until(() => $g('.dlg'), 2000, 'the dialogue');
  const during = underFinger(px, py);
  expect(!(during && during.closest('.hudcard')), 'with a dialogue open, the portrait is not under the finger');
  expectEqual(G('document.body.dataset.layer'), 'dialogue', 'the body knows a dialogue is the top layer');
  G('Dialogue.close()'); await sleep(50);
  const after = underFinger(px, py);
  expectEqual(describe(after), describe(before), 'and whatever was under the finger before is back once the dialogue closes');
  expect(!(during && during.closest('#ui')), 'during the dialogue nothing from the HUD layer is under the finger (was ' + describe(during) + ')');
});

test('Touch: a long name stays inside its frame', async () => {
  await openWorld();
  G("dispatch('hero.name', 'left', { name: 'Abcdefghijklmnopqrstuvwx' })");
  await sleep(100);
  const card = $g('.hudcard.seat-left'), name = $g('.hudcard.seat-left .name');
  expectEqual(name.textContent, 'Abcdefghijklmnopqrstuvwx', 'the 24-letter name is on the card');
  expect(name.getBoundingClientRect().right <= card.getBoundingClientRect().right + 0.5, 'the name does not run past the card');
  expect(name.scrollWidth > name.clientWidth, 'it is cut short with dots rather than squashed');
  G("Dialogue.say({ seat: 'left', who: S.heroes.left.name, text: 'hello' })");
  await until(() => $g('.dlg .plate'), 2000, 'the name plate');
  const plate = $g('.dlg .plate'), body = $g('.dlg .body');
  expect(plate.getBoundingClientRect().right <= body.getBoundingClientRect().right + 0.5, 'the name plate stays inside the dialogue box');
  G('Dialogue.close()');
});

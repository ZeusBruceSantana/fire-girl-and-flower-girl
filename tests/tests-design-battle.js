'use strict';
/* Phase C, the party in battle and the four ceremonies. Every test name starts "Design:".
   Uses the battle helpers from tests-battle.js (openWorldB, startBattle, castMove, answerChallenge). */

const battleRectOf = el => el.getBoundingClientRect();

test('Design: the party stands on the left as cut-outs, one per hero, facing the trouble', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left', 'right'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left', 4000, "the first hero's turn");
  const cuts = $$g('#battle .stage-party .cutout');
  expectEqual(cuts.map(c => c.dataset.seat), ['left', 'right'], 'one cut-out per party member, in party order');
  for (const c of cuts) expect(c.querySelectorAll('.doll img').length > 0, 'the ' + c.dataset.seat + ' cut-out shows her pictures');
  const trouble = battleRectOf($g('#battle .trouble .sprite'));
  for (const c of cuts) expect(battleRectOf(c).right < trouble.left, 'the ' + c.dataset.seat + ' cut-out stands left of the trouble');
  expect($g('#battle .cutout[data-seat="left"]').classList.contains('turn'), 'the hero whose turn it is steps forward');
  expect(!$g('#battle .cutout[data-seat="right"]').classList.contains('turn'), 'the other waits');
  expect(parseFloat(W.getComputedStyle($g('#battle .cutout .doll')).animationDuration) > 0, 'the party bobs while it waits');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Design: the battle cards are the world HUD card, one per hero, with status chips beside them', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left', 'right'] });
  await until(() => $$g('#battle .member .hudcard').length === 2, 4000, 'the party cards');
  for (const card of $$g('#battle .member .hudcard')) {
    expect(card.querySelector('.portrait .ring') && card.querySelector('.ember .bar') && card.querySelector('.level'), 'a battle card has the HUD medallion, level and ember meter');
    expect(!card.querySelector('.objective'), 'no objective line in battle');
  }
  G("Battle.state.soot.right = 1; Battle.renderParty()");
  expect($g('#battle .member[data-seat="right"] .chips .status.soot'), 'soot shows as a chip beside her card');
  expect($g('#battle .cutout[data-seat="right"]').classList.contains('sooty'), 'and on her cut-out');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Design: every move card has its element colour and glyph; support moves keep the heart', async () => {
  await openWorldB();
  G(`dispatch('hero.xp', 'left', { amount: xpForLevel(4) }); Battle.rng = () => 0.1`);
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move[data-spell="glow"]'), 4000, 'her move panel');
  for (const m of $$g('#battle .move')) {
    expect(m.dataset.element, m.dataset.spell + ' says its element');
    expect(W.getComputedStyle(m).getPropertyValue('--el').trim() !== '', m.dataset.spell + ' has an element colour');
    expect(m.querySelector('.icon svg'), m.dataset.spell + ' has a glyph');
  }
  expectEqual($g('#battle .move[data-spell="spark"]').dataset.element, 'fire', 'Spark is fire');
  expectEqual($g('#battle .move[data-spell="glow"]').dataset.element, 'light', 'Glow counts as light');
  expect($g('#battle .move[data-spell="spark"] .icon').innerHTML !== $g('#battle .move[data-spell="glow"] .icon').innerHTML, 'fire and light have different glyphs');
  expectEqual($g('#battle .move[data-spell="warm"] .icon path').getAttribute('d'), G('ART.heart').match(/d="([^"]+)"/)[1], 'Warm, a support move, keeps the heart');
  expect(W.getComputedStyle($g('#battle .message')).fontFamily.includes('Baloo 2'), 'the "your move" banner is in the display face');
  expect($g('#battle .message').classList.contains('banner'), 'her turn is announced as a banner');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Design: the Giggle meter has a face that cheers up as it fills', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => $g('#battle .giggle .mood svg'), 4000, 'the giggle face');
  expectEqual($g('#battle .giggle .mood').dataset.mood, 'grumpy', 'it starts grumpy');
  G('Battle.state.meter = Math.ceil(Battle.state.max * 0.4); Battle.renderTrouble()');
  expectEqual($g('#battle .giggle .mood').dataset.mood, 'unsure', 'then unsure');
  G('Battle.state.meter = Math.ceil(Battle.state.max * 0.7); Battle.renderTrouble()');
  expectEqual($g('#battle .giggle .mood').dataset.mood, 'happy', 'then happy');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Design: a battle win opens its ceremony, fills the xp bar and shows a level card for a girl who levels', async () => {
  await openWorldB();
  G(`Ceremony.hold = true; dispatch('hero.xp', 'left', { amount: xpForLevel(2) - 1 }); Battle.rng = () => 0.1`);
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['right', 'left'] });
  await castMove('right', 'sprout');
  await castMove('left', 'spark');
  await until(() => $g('#ceremony.show.cer-battle'), 6000, 'the battle-win ceremony');
  expect($g('#ceremony .cer-title').textContent.includes('Grumpy Weed'), 'it names the trouble');
  expectEqual($$g('#ceremony .cer-col').map(c => c.dataset.seat), ['right', 'left'], 'one column per player');
  expect($g('#ceremony .cer-col[data-seat="left"] .cer-level[data-level="2"]'), 'Fire Girl reached level 2: the level card shows');
  expect(!$g('#ceremony .cer-col[data-seat="right"] .cer-level'), 'Flower Girl did not level');
  await until(() => parseFloat($g('#ceremony .cer-col[data-seat="right"] .cer-xp .in').style.width) > 0, 2000, 'the xp bar to fill');
  expectEqual(G('sceneLayer'), 'ceremony', 'the ceremony is the top layer');
  expectEqual(G('window.__battle'), null, 'the battle waits for the tap');
  tap($g('#ceremony [data-go]'));
  await until(() => G('window.__battle'), 3000, 'the battle to end after the tap');
  expect(!$g('#ceremony.show'), 'the ceremony closed');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
  expectEqual(G('S.heroes.left.level'), 2, 'the level was really dispatched');
});

test('Design: the class-end ceremony shows each girl her own stars, coins and what she found', async () => {
  await openWorldB();
  G(`Ceremony.hold = true; window.__c = null; Ceremony.classEnd({ subject: 'spells', teacher: 'Madame Cinder', line: 'Very good.', rows: [
      { seat: 'left', stars: 3, coins: 6, xp: 35, found: 'charcoal', levelFrom: 1, levelTo: 1 },
      { seat: 'right', stars: 1, coins: 2, xp: 25, found: null, levelFrom: 1, levelTo: 2 }] }).then(r => { window.__c = r; })`);
  await until(() => $g('#ceremony.show.cer-class'), 2000, 'the class-end ceremony');
  expect($g('#ceremony .cer-title').textContent.includes('Spells'), 'it names the class');
  expectEqual($$g('#ceremony .cer-col[data-seat="left"] .cer-star.on').length, 3, 'three stars for the left girl');
  expectEqual($$g('#ceremony .cer-col[data-seat="right"] .cer-star.on').length, 1, 'one for the right girl');
  expect($g('#ceremony .cer-col[data-seat="left"]').textContent.includes('6 coins'), 'her coins');
  expect($g('#ceremony .cer-col[data-seat="left"] .found').textContent.includes('charcoal'), 'her material');
  expect($g('#ceremony .cer-col[data-seat="right"] .cer-level[data-level="2"]'), 'a level card for the girl who levelled in class');
  const delays = $$g('#ceremony .cer-star.on').map(s => parseFloat(W.getComputedStyle(s).animationDelay));
  expect(delays[1] > delays[0] && delays[2] > delays[1], 'the stars appear one by one');
  expectEqual($$g('#ceremony .btn').length, 1, 'one button to go on');
  tap($g('#ceremony [data-go]'));
  await until(() => G('window.__c') === true, 2000, 'the ceremony to resolve');
  expect(!$g('#ceremony.show'), 'and close');
});

test('Design: the level-up card opens on its own and names the new spell', async () => {
  await openWorldB();
  G(`Ceremony.hold = true; window.__l = null; Ceremony.levelUp('left', 4).then(r => { window.__l = r; })`);
  await until(() => $g('#ceremony.show.cer-level'), 2000, 'the level-up card');
  expectEqual($g('#ceremony .cer-medal b').textContent, '4', 'the medal shows the new level');
  expect($g('#ceremony .cer-level').textContent.includes('Glow'), 'level 4 opens Glow for Fire Girl');
  tap($g('#ceremony [data-go]'));
  await until(() => G('window.__l') === true, 2000, 'the card to close');
});

test('Design: the bedtime page shows the day and names tomorrow\'s two classes', async () => {
  await openWorldB();
  G("Ceremony.hold = true; dispatch('clock.part', 'left', { day: 1, part: 'free' }); dispatch('hero.coins', 'left', { amount: 7 }); Day.onThing('left', { action: 'sleep' })");
  await until(() => $g('#ceremony.show.cer-bedtime'), 3000, 'the bedtime page');
  expect($g('#ceremony .cer-title').textContent.includes('Day 1'), 'it names the day that ended');
  expectEqual($$g('#ceremony .cer-col').length, 2, 'one column per girl');
  expectEqual($$g('#ceremony .cer-col[data-seat="left"] .cer-num').length, 4, 'stars, words, coins and hearts');
  expect($g('#ceremony .cer-col[data-seat="left"]').textContent.includes('7'), 'her coins');
  const tomorrow = $g('#ceremony .cer-tomorrow').textContent;
  expect(tomorrow.includes('Myths') && tomorrow.includes('Art'), 'tomorrow is Myths and Art (' + tomorrow + ')');
  expectEqual(G('Day.day'), 1, 'still day 1 until she says goodnight');
  expect($g('#ceremony [data-go]').classList.contains('confirm'), 'Goodnight is a confirm button');
  tap($g('#ceremony [data-go]'));
  for (let i = 0; i < 6 && G('Day.day') === 1; i++) { await tapNext(); await sleep(60); }
  await until(() => G('Day.day') === 2, 4000, 'a new day');
});

test('Design: with reduced motion the ceremony stars are all there at once', async () => {
  await openWorldB();
  G(`document.documentElement.classList.add('reduce-motion'); Ceremony.hold = true; Ceremony.classEnd({ subject: 'spells', rows: [{ seat: 'left', stars: 3, coins: 6, xp: 0 }] })`);
  try {
    await until(() => $g('#ceremony.show'), 2000, 'the ceremony');
    for (const s of $$g('#ceremony .cer-star.on')) expectEqual(W.getComputedStyle(s).animationDelay, '0s', 'no waiting for a star');
  } finally { G("document.documentElement.classList.remove('reduce-motion'); Ceremony.close()"); }
});

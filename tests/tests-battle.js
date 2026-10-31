'use strict';
/* Battle tests (version 3). Each opens a ready game into the world, starts a battle with Battle.start, and
   plays it by tapping moves and answering the word challenges. */

async function openWorldB() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
async function answerChallenge(seat) {   // answer this seat's challenge right, first try
  await until(() => G(`!!Challenge.active['${seat}']`), 3000, 'a word challenge for ' + seat);
  const a = G(`({ type: Challenge.active['${seat}'].type, word: Challenge.active['${seat}'].word })`);
  if (a.type === 'letter-tiles') { for (const g of G(`Words.sounds(${JSON.stringify(a.word)})`).map(x => x.g)) { tap($$g(`.ch-card.seat-${seat} .ch-tile:not(.used)`).find(t => t.dataset.l === g)); await sleep(20); } }
  else tap($g(`.ch-card.seat-${seat} .ch-opt[data-w="${CSS.escape(a.word)}"]`));
  await until(() => G(`!Challenge.active['${seat}']`), 3000, 'the challenge to finish');
}
async function castMove(seat, spellId) {
  await until(() => G('Battle.state && Battle.state.turnSeat') === seat && $g(`#battle .move[data-spell="${spellId}"]`), 4000, seat + "'s move panel");
  tap($g(`#battle .move[data-spell="${spellId}"]`));
  await answerChallenge(seat);
}
function startBattle(opts) { G(`window.__battle = null; Battle.start(${JSON.stringify(opts)}).then(r => { window.__battle = r; })`); }

test('A battle: Sprout then a super-effective Spark fills the Giggle meter and pays out', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['right', 'left'] });
  await until(() => G('Battle.active'), 2000, 'the battle to open');
  expect($g('#battle.show .trouble .giggle'), 'the trouble has a Giggle meter');
  expectEqual(G('Battle.state.max'), 9, 'giggle 9 for a level-1 weed: two moves, never one');
  await castMove('right', 'sprout');                       // flower vs weed: no match
  await until(() => G('Battle.state.meter') === 3, 3000, 'meter 3 after Sprout');
  expect(!$g('#battle .message .w').textContent.includes('Super'), 'no super effective for a plain match');
  await castMove('left', 'spark');                         // fire vs weed: weak to fire
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expect($g('#battle .message') === null || !G('Battle.active'), 'the screen closed');
  const r = G('window.__battle');
  expectEqual([r.won, r.xp], [true, 6], 'won, 6 xp from a level-1 weed at level 1');
  expect(r.coins > 0, 'coins');
  const S = G('S');
  expect(S.heroes.left.xp >= 6 && S.heroes.right.xp >= 6, 'both players got xp');
  expectEqual([S.heroes.left.troubles['grumpy-weed'], S.heroes.right.troubles['grumpy-weed']], [1, 1], 'both remember cheering up a weed');
  expect(S.heroes.left.coins > 0, 'coins landed');
  expect(S.shared.events.some(e => e.what === 'battle' && e.trouble === 'grumpy-weed'), 'the win is in the shared events');
  expectEqual(G('Battle.active'), false, 'battle over');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('A battle move from the companion seat is automatic and earns nothing', async () => {
  await openWorldB();
  G("dispatch('hero.setup', 'away', { kind: 'electric', color: 'purple' }); Battle.rng = () => 0.1");
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['away', 'left'] });
  await until(() => G('Battle.state && Battle.state.meter') === 3, 4000, 'the cousin to auto-cast Zap (+3)');
  expect(G("Battle.state.turnSeat") !== 'away' || !$g('#battle .moves.show'), 'no move panel for an automatic turn');
  await castMove('left', 'spark');
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expectEqual(G('S.heroes.away.xp'), 0, 'the companion-driven cousin earned no xp');
  expectEqual(G('S.heroes.away.coins'), 0, 'nor coins');
  expect(G('S.heroes.left.xp') >= 6, 'the player did');
});

test('A battle trouble can zap ember away, but never below zero and never anything else', async () => {
  await openWorldB();
  G("dispatch('hero.ember', 'right', { amount: -5 }); Battle.rng = () => 0.99");   // ember 0; rng picks the last action: cold-snap's "zap"
  const before = G('({ coins: S.heroes.right.coins, xp: S.heroes.right.xp, items: S.heroes.right.inventory.length })');
  startBattle({ troubles: [{ kind: 'cold-snap', level: 2 }], backdrop: 'woods-path', party: ['right'] });
  await castMove('right', 'sprout');                       // +3 of 20: not full, so the trouble gets a turn
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2 after the trouble\'s turn');
  expectEqual(G('S.heroes.right.ember'), 0, 'a word in battle earns no ember, and the zap cannot go below 0');
  const after = G('({ coins: S.heroes.right.coins, xp: S.heroes.right.xp, items: S.heroes.right.inventory.length })');
  expectEqual(after, before, 'nothing else changed');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 3000, 'cancelled');
});

test('A boss battle has two phases', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1, boss: true }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.max') === 18, 3000, 'a boss meter of 18');
  await castMove('left', 'spark');                         // 6
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2');
  await castMove('left', 'spark');                         // 6 x 1.5 combo (she matched last time too) = 9: 15
  await until(() => G('Battle.state.round') === 3, 4000, 'round 3');
  expect($g('#battle .message .w').textContent.includes('Combo') || G('Battle.state.meter') === 15, 'a matched move after a matched move combos');
  await castMove('left', 'spark');                         // 24 > 18: phase 2
  await until(() => G('Battle.state.phase') === 2, 4000, 'phase 2');
  expectEqual(G('Battle.state.max'), 9, 'the second phase is half as long');
  await until(() => G('Battle.state.round') === 4, 4000, 'the boss took its phase-2 turn');
  expect(G('Battle.state.soot.left') === 1, 'the big sneeze put soot on her (phase 2 has its own trick)');
  await castMove('left', 'spark');
  await until(() => G('window.__battle'), 8000, 'the boss to be beaten');
  expectEqual(G('window.__battle.won'), true, 'won');
  expectEqual(G('window.__battle.xp'), 12, 'double xp for a boss');
});

test('A battle can always go on: a hero with no ember still casts her level-1 spell', async () => {
  await openWorldB();
  G("dispatch('hero.ember', 'left', { amount: -5 }); Battle.rng = () => 0.1");
  expectEqual(G('S.heroes.left.ember'), 0, 'ember is empty');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left', 3000, 'her turn');
  const spark = $g('#battle .move[data-spell="spark"]');
  expect(spark && !spark.classList.contains('poor') && !spark.classList.contains('locked'), 'Spark is free and open');
  expect($g('#battle .move[data-spell="spark"] .cost').textContent === 'free', 'and says so');
  await castMove('left', 'spark');                         // 6 of 9
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2');
  await castMove('left', 'spark');                         // 6 x 1.5 combo: done
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expect(G('S.heroes.left.ember') >= 0, 'ember never went negative');
});

async function answerTiles(seat) {   // answer a letter-tiles card for this seat, first try
  await until(() => G(`!!Challenge.active['${seat}']`), 4000, 'a word challenge for ' + seat);
  const w = G(`Challenge.active['${seat}'].word`);
  for (const g of G(`Words.sounds(${JSON.stringify(w)})`).map(x => x.g)) { tap($$g(`.ch-card.seat-${seat} .ch-tile:not(.used)`).find(t => t.dataset.l === g)); await sleep(20); }
  await until(() => G(`!Challenge.active['${seat}']`), 3000, 'the challenge to finish');
}

test('A together battle move: both girls power their part, tap together, and the meter jumps', async () => {
  await openWorldB();
  G("dispatch('hero.xp', 'left', { amount: 120 }); dispatch('hero.xp', 'right', { amount: 120 }); Battle.rng = () => 0.1");
  expectEqual(G('S.heroes.left.level'), 3, 'level 3');
  startBattle({ troubles: [{ kind: 'sneezy-smoke', level: 3 }], backdrop: 'woods-path', party: ['left', 'right'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move.together[data-spell="lantern-flower"]'), 4000, 'Lantern Flower on the move list');
  expect(!$g('#battle .move.together[data-spell="ember-bloom"]'), 'Ember Bloom needs level 8 and all three');
  const emberBefore = G('[S.heroes.left.ember, S.heroes.right.ember]');
  tap($g('#battle .move.together[data-spell="lantern-flower"]'));
  await answerTiles('left');
  await answerTiles('right');
  await until(() => $g('#battle .together-tap'), 3000, 'the together tap moment');
  expect($$g('#battle .together-tap .tapbtn').length === 2, 'one big button per girl');
  tap($g('#battle .together-tap .tapbtn[data-seat="left"]'));
  tap($g('#battle .together-tap .tapbtn[data-seat="right"]'));
  await until(() => G('Battle.state.meter') >= 12, 4000, 'the meter to jump');
  // (1+3)*1.5 + (1+3)*1.5 = 12, ×2 (flower vs smoke) = 24; max is 10*3 = 30: the biggest move, but not a one-shot
  expectEqual(G('Battle.state.meter'), 24, 'the together move is the biggest move, not the whole fight');
  const emberAfter = G('[S.heroes.left.ember, S.heroes.right.ember]');
  expectEqual(emberAfter, [emberBefore[0] - 4, emberBefore[1] - 4], 'each paid 4 and earned nothing from her part: a finisher, not every turn');
  expect(G("S.heroes.left.badges.includes('together') && S.heroes.right.badges.includes('together')"), 'both got the together badge');
  expect(!G("S.heroes.left.badges.includes('all-three')"), 'all-three needs three');
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2');
  expect($g('#battle .move.together[data-spell="lantern-flower"]').classList.contains('poor'), 'with 1 ember left, the together spell is out of reach');
  await castMove('left', 'spark');                         // 3: 27
  await castMove('right', 'sprout');                       // flower vs smoke, 6: 33 > 30
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expectEqual(G('window.__battle.won'), true, 'won');
});

test('A together battle move with the companion: her part just works, no tap window needed', async () => {
  await openWorldB();
  G("dispatch('hero.setup', 'away', { kind: 'electric', color: 'purple' }); dispatch('hero.xp', 'left', { amount: 120 }); dispatch('hero.leave', 'right', {}); Battle.rng = () => 0.9");
  startBattle({ troubles: [{ kind: 'cold-snap', level: 1 }], backdrop: 'woods-path', party: ['left', 'away'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $$g('#battle .move').length > 0, 4000, "left's turn");
  expect($g('#battle .move.together[data-spell="firework"]'), 'Firework (fire + electric) is offered with the companion cousin');
  tap($g('#battle .move.together[data-spell="firework"]'));
  await answerTiles('left');
  await until(() => G('Battle.state.meter') > 0, 4000, 'the move to land without a tap window');
  expect(!$g('#battle .together-tap'), 'no tap window with only one real player');
  expect(G("S.heroes.away.badges.includes('together')"), 'the cousin gets the badge too');
  G('Battle.cancel()');
});

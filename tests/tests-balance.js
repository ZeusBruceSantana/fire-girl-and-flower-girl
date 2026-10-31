'use strict';
/* Phase B, the battle rebalance (docs/review/03-systems-and-balance.md): ember is a real cost, the match is a choice,
   combos cross princesses, support moves give the party roles, xp follows the level gap, levels cap at 10.
   Every test name starts with "Balance:". Helpers (openWorldB, startBattle, castMove) come from tests-battle.js. */

const levelUp = (seat, level) => G(`dispatch('hero.xp', '${seat}', { amount: xpForLevel(${level}) - S.heroes.${seat}.xp })`);

test('Balance: a spell is paid before the word, the word earns nothing, and an empty meter greys the big move', async () => {
  await openWorldB();
  levelUp('left', 4);                                      // Glow (cost 3, counts as light) is open
  G("dispatch('hero.leave', 'right', {}); Battle.rng = () => 0.1");
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move[data-spell="glow"]'), 4000, 'her move panel');
  expectEqual(G('S.heroes.left.ember'), 5, 'five ember to start');
  tap($g('#battle .move[data-spell="glow"]'));
  await until(() => G("!!Challenge.active.left"), 3000, 'the word card');
  expectEqual(G('S.heroes.left.ember'), 2, 'three ember went BEFORE the word');
  await answerChallenge('left');
  await until(() => G('Battle.state.meter') === 6, 3000, 'Glow landed: (1+3) x 1.5 = 6, no match (a weed is not weak to light)');
  expectEqual(G('S.heroes.left.ember'), 2, 'and the word earned nothing back');
  await until(() => G('Battle.state.round') === 2 && $g('#battle .move[data-spell="glow"]'), 4000, 'round 2');
  expect($g('#battle .move[data-spell="glow"]').classList.contains('poor'), 'with 2 ember, Glow (3) is greyed');
  expect(!$g('#battle .move[data-spell="spark"]').classList.contains('poor'), 'Spark stays free');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 3000, 'cancelled');
});

test('Balance: the off-element move finds the match, so which move is a real question', async () => {
  await openWorldB();
  levelUp('right', 4);                                     // Vine (counts as earth) is open
  G("dispatch('hero.leave', 'left', {}); Battle.rng = () => 0.1");
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['right'] });
  await castMove('right', 'vine');                         // a weed is weak to fire AND earth: (1+3) x 1.5 x 2 = 12 > 9
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expect(G('Speech.log.some(t => t.includes("Super effective"))'), 'Flower Girl can be super effective against a weed with the right pick');
  expectEqual(G('window.__battle.won'), true, 'won');
});

test('Balance: a combo crosses princesses: Flower matches, then Fire matches with her off-element move', async () => {
  await openWorldB();
  levelUp('left', 4); levelUp('right', 4);
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'sneezy-smoke', level: 2 }], backdrop: 'woods-path', party: ['right', 'left'] });
  await until(() => G('Battle.state && Battle.state.max') === 20, 3000, 'smoke, 20 giggle');
  await castMove('right', 'sprout');                       // flower vs smoke: 2 x 1.5 x 2 = 6
  await until(() => G('Battle.state.meter') === 6, 3000, 'six');
  await castMove('left', 'glow');                          // light vs smoke, after a match: 4 x 1.5 x 2 x 1.5 = 18
  await until(() => G('Battle.state.meter') >= 20, 4000, 'the combo to land');
  expect(G('Speech.log.some(t => t.includes("Combo"))'), 'Combo! was called');
  await until(() => G('window.__battle'), 6000, 'the battle to end');
  expectEqual(G('window.__battle.won'), true, 'won');
});

test('Balance: Warm untangles a friend and makes her next move bigger; a tangle never hits the same girl twice running', async () => {
  await openWorldB();
  levelUp('left', 2); levelUp('right', 2);
  G('Battle.rng = () => 0.9');                              // a weed picks "tangle" and the trouble aims at the second player
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 2 }], backdrop: 'woods-path', party: ['left', 'right'] });
  await until(() => G('Battle.state && Battle.state.max') === 18, 3000, 'a level-2 weed');
  await castMove('left', 'spark');                         // 6
  await castMove('right', 'sprout');                       // 3: 9
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2');
  expectEqual(G('Battle.state.skip.right'), true, 'the weed tangled Flower Girl');
  expectEqual(G('Battle.state.lastTangled'), 'right', 'and remembers it');
  await castMove('left', 'warm');                          // support: costs 2, untangles her, boosts her
  await until(() => G('Battle.state.meter') === 10, 3000, 'a support move tickles the meter by one');
  expectEqual(G('S.heroes.left.ember'), 3, 'Warm cost 2 of her 5');
  expectEqual(G('Battle.state.skip.right'), false, 'Flower Girl is untangled');
  expectEqual(G('Battle.state.boost.right'), 1, 'and warmed up');
  await castMove('right', 'sprout');                       // 2 x 1.5 x 1.5 (warmed) = 4.5 -> 5: 15
  await until(() => G('Battle.state.meter') === 15, 3000, 'her boosted Sprout');
  await until(() => G('Battle.state.round') === 3, 4000, 'round 3');
  expectEqual(G('Battle.state.lastTangled'), 'left', 'this time the tangle went to Fire Girl, never the same girl twice running');
  expectEqual(G('Battle.state.skip.right'), false, 'Flower Girl is free');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 3000, 'cancelled');
});

test('Balance: Dew clears soot and calms the trouble for a turn', async () => {
  await openWorldB();
  levelUp('right', 2);
  G("dispatch('hero.leave', 'left', {}); Battle.rng = () => 0.1");   // smoke picks "soot"
  startBattle({ troubles: [{ kind: 'sneezy-smoke', level: 2 }], backdrop: 'woods-path', party: ['right'] });
  await castMove('right', 'sprout');                       // 6 of 20
  await until(() => G('Battle.state.round') === 2, 4000, 'round 2');
  expectEqual(G('Battle.state.soot.right'), 1, 'soot on her');
  await castMove('right', 'dew');
  await until(() => G('Battle.state.round') === 3, 4000, 'round 3');
  expectEqual(G('Battle.state.soot.right'), 0, 'the soot is gone, and the calmed smoke did not sneeze it back');
  expect(G('Speech.log.some(t => t.includes("deep breath"))'), 'the smoke took a breath instead of acting');
  expectEqual(G('S.heroes.right.ember'), 2, 'Dew cost 2 plus 1 for the soot');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 3000, 'cancelled');
});

test('Balance: xp follows the level gap and a fight with no first-try word pays half', async () => {
  await openWorldB();
  const weed = (level, boss, heroLevel, firstTry) => G(`Battle.xpFor(WORLD.troubles['grumpy-weed'], { level: ${level}, boss: ${boss} }, ${heroLevel}, ${firstTry})`);
  expectEqual(weed(1, false, 1, true), 6, 'a level-1 weed to a level-1 hero: 6');
  expectEqual(weed(1, false, 3, true), 3, 'to a level-3 hero: half');
  expectEqual(weed(1, false, 5, true), 2, 'to a level-5 hero: a quarter, rounded');
  expectEqual(weed(1, false, 9, true), 2, 'never less than a quarter');
  expectEqual(weed(1, false, 1, false), 3, 'no first-try word: half');
  expectEqual(weed(1, true, 1, true), 12, 'a boss: double');
  expectEqual(weed(3, false, 1, true), 18, 'a level-3 weed to a level-1 hero: full, never more than full');
});

test('Balance: levels stop at 10 and late levels grow the Ember meter', async () => {
  await openWorldB();
  G("dispatch('hero.xp', 'left', { amount: 50000 })");
  expectEqual(G('S.heroes.left.level'), 10, 'the cap');
  expectEqual(G('S.heroes.left.maxEmber'), 14, '10 plus 2 at level 9 plus 2 at level 10');
  G("dispatch('hero.equip', 'left', { slot: 'hand', item: 'wand-candle' })");
  expectEqual(G('S.heroes.left.maxEmber'), 16, 'gear still adds on top');
  G("dispatch('hero.xp', 'right', { amount: xpForLevel(9) })");
  expectEqual([G('S.heroes.right.level'), G('S.heroes.right.maxEmber')], [9, 12], 'level 9: a bigger meter');
  G("for (let i = 0; i < 5; i++) dispatch('hero.trouble', 'right', { kind: 'cold-snap' })");
  expectEqual(G("S.heroes.right.troubles['cold-snap']"), 5, 'five Cold Snaps cheered up: a friend (the Journal lists it)');
});

test('Balance: ember gear makes her first paid move each day free, once a day', async () => {
  await openWorldB();
  levelUp('left', 4);
  G("dispatch('hero.item', 'left', { item: 'crown-ember' }); dispatch('hero.equip', 'left', { slot: 'head', item: 'crown-ember' }); dispatch('hero.leave', 'right', {}); Battle.rng = () => 0.1");
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move[data-spell="glow"]'), 4000, 'her move panel');
  const ember0 = G('S.heroes.left.ember');
  expectEqual(G("Battle.spellsFor('left').find(s => s.id === 'glow').cost"), 0, 'Glow is free today with the ember crown');
  tap($g('#battle .move[data-spell="glow"]'));
  await until(() => G("!!Challenge.active.left"), 3000, 'the word card');
  expectEqual(G('S.heroes.left.ember'), ember0, 'no ember paid for the free move');
  expectEqual(G('S.heroes.left.freeMoveDay'), G('S.shared.clock.day'), 'the free move is used up for today');
  expect(G("Battle.spellsFor('left').find(s => s.id === 'glow').cost") > 0, 'the next paid move costs ember again');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'cancelled');
  G("dispatch('clock.day', null, { day: S.shared.clock.day + 1 })");
  expect(G("(S.heroes.left.freeMoveDay || 0) < S.shared.clock.day"), 'a new day brings the free move back');
});

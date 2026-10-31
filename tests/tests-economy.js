'use strict';
/* Phase B, the economy lane: hearts that land on time, class coins, coin sinks, cozy Lair bits, the periscope,
   the Three Stars badge at ten, bedtime refill, and the Journal's list of troubles cheered up.
   Every test name starts with "Economy:" so `node tests/run-in-ci.js economy` runs just these. */

async function openWorldEco() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}

test('Economy: a thoughtful lunch reply on the first try gives three hearts, the fund gets a copy, and spending never drains it', async () => {
  await openWorldEco();
  G("dispatch('clock.part', 'left', { day: 1, part: 'lunch' })");
  G("Stage.scene = Object.assign({}, SCENES.cafeteria, { id: 'cafeteria' }); Day.sitAtTable('left', SCENES.cafeteria.hotspots.find(h => h.id === 'table-1'))");
  await sleep(80); await tapNext();
  await until(() => $g('.dlg .choices.show'), 4000, 'Wren asks something');
  const kindIndex = G("FRIENDS.ice.talks[(1 + 0) % FRIENDS.ice.talks.length].replies.findIndex(r => r.kind)");
  tap($$g('.dlg .choice')[kindIndex]); await sleep(80);
  await dismissDialogues();
  await until(() => (G('S.heroes.left.friends.ice') || 0) >= 3, 3000, 'three hearts with Wren');
  expectEqual(G('S.heroes.left.friends.ice'), 3, 'the thoughtful reply, first try, is three hearts');
  expectEqual(G('S.heroes.left.hearts'), 3, 'hers to keep');
  expectEqual(G('S.shared.lair.fund'), 3, 'and the fund got a copy of all three');
  G("dispatch('hero.hearts', 'left', { amount: -2 })");          // an invite
  expectEqual(G('S.heroes.left.hearts'), 1, 'the invite cost her two');
  expectEqual(G('S.shared.lair.fund'), 3, 'the fund is untouched by spending');
});

test('Economy: friend levels land at 3 / 6 / 10 / 15 hearts', async () => {
  await openWorldEco();
  const level = n => G(`FRIENDS.ice.levels.filter(l => ${n} >= l.hearts).length`);
  expectEqual([level(0), level(3), level(6), level(10), level(15)], [1, 2, 3, 4, 5], 'the ladder');
  expect(G('FRIENDS.ice.levels[2].visit'), 'level 3 is the visit');
  expect(G('Object.values(FRIENDS).every(f => f.levels.map(l => l.hearts).join() === "0,3,6,10,15")'), 'every friend uses the same ladder');
  G("dispatch('lair.upgrade', 'left', { id: 'lantern', hearts: 0 }); dispatch('lair.upgrade', 'left', { id: 'snack-corner', hearts: 0 }); dispatch('lair.upgrade', 'left', { id: 'guest-cushion', hearts: 0 }); dispatch('hero.hearts', 'left', { amount: 6, friend: 'ice' })");
  G("Lair.open('left', 'invite')");
  await until(() => $$g('#lair .lair-friend').length > 0, 2000, 'friends');
  expect($g('#lair .lair-friend[data-f="ice"].can [data-invite]'), 'with 6 hearts Wren can be invited');
  tap($g('#lair [data-close]')); await sleep(30);
});

test('Economy: a class pays 2, 4 or 6 coins by stars', async () => {
  await openWorldEco();
  G("dispatch('clock.part', 'left', { day: 1, part: 'period1' })");
  G("Day.onThing('left', { action: 'lesson' })"); await sleep(50); await tapNext();
  await until(() => $$g('.ch-card').length === 2, 4000, 'two challenge cards');
  for (let i = 0; i < 8 && G('Day.part') === 'period1'; i++) { await answerAll('left'); await answerAll('right'); await sleep(60); if ($g('.dlg')) await tapNext(); }
  await until(() => G('Day.part') === 'period2', 6000, 'second class');
  const stars = G("S.heroes.left.stars['day-1-period1-spells']");
  expect(stars >= 1 && stars <= 3, 'stars were given');
  expectEqual(G('S.heroes.left.coins'), stars * 2, 'coins are twice the stars');
  expect(!G("S.heroes.left.badges.includes('three-stars')"), 'one three-star class is not the badge yet');
});

test('Economy: the warm roll gives 4 ember and the lantern pie fills the meter for 6 coins', async () => {
  await openWorldEco();
  G("dispatch('hero.coins', 'left', { amount: 10 }); dispatch('hero.ember', 'left', { amount: -5 }); Shop.open('left', 'bakery')");
  await until(() => $g('#shop.show .shop-card[data-treat="lantern-pie"]'), 3000, 'the pie on the shelf');
  expectEqual(G("SHOPS.bakery.treats.find(t => t.id === 'warm-roll').ember"), 4, 'the roll is +4');
  tap($g('#shop .shop-card[data-treat="warm-roll"]'));
  await until(() => G('S.heroes.left.ember') === 4, 3000, 'four ember from the roll');
  expectEqual(G('S.heroes.left.coins'), 8, 'the roll cost 2');
  tap($g('#shop .shop-card[data-treat="lantern-pie"]'));
  await until(() => G('S.heroes.left.ember') === G('S.heroes.left.maxEmber'), 3000, 'the pie fills the meter');
  expectEqual(G('S.heroes.left.coins'), 2, 'the pie cost 6');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Economy: a cozy bit in the lantern costs coins, not hearts, and only when she has them', async () => {
  await openWorldEco();
  G("Lair.open('left', 'upgrades')");
  await until(() => $$g('#lair .lair-spot.cozy').length > 0, 2000, 'cozy spots in the room');
  expect($$g('#lair .lair-spot.cozy').length >= 10, 'about a dozen cozy bits (' + $$g('#lair .lair-spot.cozy').length + ')');
  expect($g('#lair .cozy-title'), 'with a line saying they cost coins');
  tap($g('#lair .lair-spot[data-up="bunting"]')); await sleep(30);
  const card = $g('#lair .lair-card[data-up="bunting"]');
  expect(card.classList.contains('locked') && !card.querySelector('[data-buy]'), 'bunting cannot be bought with 0 coins');
  expect(card.querySelector('.lc-state').textContent.includes('coins'), 'and says how many coins to go');
  G("dispatch('hero.coins', 'left', { amount: 20 }); Lair.render()"); await sleep(30);
  tap($g('#lair .lair-spot[data-up="bunting"]')); await sleep(30);
  expect($g('#lair .lair-card[data-up="bunting"].buyable [data-buy]'), 'with 20 coins it can');
  const fund = G('S.shared.lair.fund');
  tap($g('#lair [data-buy="bunting"]')); await sleep(50);
  expect(G("S.shared.lair.upgrades.includes('bunting')"), 'the bunting is up');
  expectEqual(G('S.heroes.left.coins'), 10, 'ten coins paid from her purse');
  expectEqual(G('S.shared.lair.fund'), fund, 'the hearts fund was not touched');
  expect($g('#lair .lair-card[data-up="bunting"].owned'), 'the card shows owned');
  tap($g('#lair [data-close]')); await sleep(30);
});

test('Economy: the periscope is a real effect (reveal), summed by lairEffects', async () => {
  await openWorldEco();
  expectEqual(G('lairEffects().reveal'), 0, 'nothing revealed before the periscope');
  G("dispatch('lair.upgrade', 'left', { id: 'telescope', hearts: 0 })");
  expectEqual(G('lairEffects().reveal'), 1, 'the periscope reveals hidden sparkles');
});

test('Economy: the Three Stars badge comes after ten three-star classes, not the first', async () => {
  await openWorldEco();
  G("dispatch('hero.stars', 'left', { key: 'day-1-period1-spells', stars: 3 }); Day.checkThreeStars('left')");
  expect(!G("S.heroes.left.badges.includes('three-stars')"), 'one is not enough');
  G("for (let d = 2; d <= 10; d++) dispatch('hero.stars', 'left', { key: 'day-' + d + '-period1-spells', stars: 3 }); Day.checkThreeStars('left')");
  expect(G("S.heroes.left.badges.includes('three-stars')"), 'ten three-star classes earn the badge');
});

test('Economy: bedtime refills ember to the top', async () => {
  await openWorldEco();
  G("dispatch('clock.part', 'left', { day: 1, part: 'free' }); dispatch('hero.ember', 'left', { amount: -5 }); dispatch('hero.equip', 'right', { slot: 'hand', item: 'wand-candle' }); dispatch('hero.ember', 'right', { amount: -5 })");
  expectEqual(G('S.heroes.left.ember'), 0, 'empty');
  G("Day.onThing('left', { action: 'sleep' })"); await sleep(80);
  for (let i = 0; i < 6 && G('Day.day') === 1; i++) { await tapNext(); await sleep(60); }
  await until(() => G('Day.day') === 2, 4000, 'a new day');
  expectEqual(G('S.heroes.left.ember'), 10, 'full');
  expectEqual(G('S.heroes.right.ember'), 12, 'full to her bigger meter (candle wand)');
});

test('Economy: the Journal lists the troubles she has cheered up and calls one a friend at five', async () => {
  await openWorldEco();
  G("Menu.open('left', 'journal')");
  await until(() => $g('#menu .j-section.troubles'), 2000, 'the troubles section');
  expectEqual($$g('#menu .j-section.troubles .j-line[data-kind]').length, 0, 'none listed before any battle');
  expect($g('#menu .j-section.troubles .j-line.quiet'), 'just a gentle line instead (no row of question marks)');
  G("for (let i = 0; i < 5; i++) dispatch('hero.trouble', 'left', { kind: 'grumpy-weed' }); dispatch('hero.trouble', 'left', { kind: 'cold-snap' }); Menu.render()");
  await sleep(30);
  const weed = $g('#menu .j-section.troubles .j-line[data-kind="grumpy-weed"]'), snap = $g('#menu .j-section.troubles .j-line[data-kind="cold-snap"]');
  expect(weed.textContent.includes('Grumpy Weed') && weed.textContent.includes('×5') && weed.textContent.includes('friend'), 'five weeds: a friend');
  expect(snap.textContent.includes('Cold Snap') && snap.textContent.includes('×1') && !snap.textContent.includes('friend'), 'one cold snap: met, not a friend yet');
  tap($g('#menu [data-close]')); await sleep(30);
});

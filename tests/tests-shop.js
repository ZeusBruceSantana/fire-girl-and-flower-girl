'use strict';
/* Shops (Epic 4): buying, selling duplicates, treats, and the make-change moment. */

async function openWorldS() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  G("dispatch('settings.set', null, { mathLevel: { left: 0, right: 0, away: 0 } })");
}

test('Shop: buying with enough coins takes the coins and puts the item in the bag', async () => {
  await openWorldS();
  G("dispatch('hero.coins', 'left', { amount: 20 }); Shop.open('left', 'bakery')");
  await until(() => $g('#shop.show .shop-card[data-item="wand-twig"]'), 3000, 'the bakery');
  expectEqual($g('#shop [data-coins]').textContent, '20', 'her coins show');
  tap($g('#shop .shop-card[data-item="wand-twig"]'));
  await until(() => G("S.heroes.left.inventory.includes('wand-twig')"), 3000, 'the wand in her bag');
  expectEqual(G('S.heroes.left.coins'), 15, 'the twig wand cost 5');
  expectEqual($g('#shop [data-coins]').textContent, '15', 'the corner updates');
  expect(G("S.shared.events.some(e => e.what === 'bought' && e.item === 'wand-twig')"), 'the purchase is in the events');
  tap($g('#shop [data-close]')); await sleep(30);
  expect(!$g('#shop.show'), 'closed');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('Shop: what she cannot afford is greyed out and nothing changes', async () => {
  await openWorldS();
  G("Shop.open('right', 'market')");
  await until(() => $g('#shop.show .shop-card[data-item="wand-candle"]'), 3000, 'the market');
  const card = $g('#shop .shop-card[data-item="wand-candle"]');
  expect(card.classList.contains('poor'), 'the candle wand is greyed at 0 coins');
  expect(card.querySelector('.note.gift') && card.querySelector('.note.gift').textContent.includes('Fire Girl'), 'it says it is for Fire Girl');
  tap(card); await sleep(60);
  expectEqual(G('S.heroes.right.coins'), 0, 'no coins taken');
  expect(!G("S.heroes.right.inventory.includes('wand-candle')"), 'no item given');
  expect($g('#shop .shop-say').textContent.length > 0, 'the keeper says something kind');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Shop: a gift for the other princess can still be bought', async () => {
  await openWorldS();
  G("dispatch('hero.coins', 'right', { amount: 40 }); Shop.open('right', 'market')");
  await until(() => $g('#shop.show .shop-card[data-item="wand-candle"]'), 3000, 'the market');
  tap($g('#shop .shop-card[data-item="wand-candle"]'));
  await until(() => G("S.heroes.right.inventory.includes('wand-candle')"), 3000, 'the gift in her bag');
  expectEqual(G('S.heroes.right.coins'), 10, 'paid 30');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Shop: selling a duplicate gives coins and removes one; the sell tab is empty with nothing to sell', async () => {
  await openWorldS();
  G("Shop.open('left', 'market')");
  await until(() => $g('#shop.show .shop-tab[data-tab="sell"]'), 3000, 'the market');
  tap($g('#shop .shop-tab[data-tab="sell"]')); await sleep(30);
  expect($g('#shop .shop-empty'), 'nothing to sell yet');
  G("dispatch('hero.item', 'left', { item: 'wand-twig' }); dispatch('hero.item', 'left', { item: 'wand-twig' }); Shop.render()");
  await sleep(30);
  expect($g('#shop .shop-card[data-sell="wand-twig"]'), 'the duplicate is for sale');
  tap($g('#shop .shop-card[data-sell="wand-twig"]'));
  await until(() => G('S.heroes.left.coins') === 1, 3000, 'one coin for the duplicate');
  expectEqual(G("S.heroes.left.inventory.filter(i => i === 'wand-twig').length"), 1, 'one wand left');
  await sleep(30);
  expect($g('#shop .shop-empty'), 'the last one is not for sale');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Shop: a collectible sells even when there is only one; the bakery does not buy', async () => {
  await openWorldS();
  G("dispatch('hero.item', 'left', { item: 'gem-amber' }); Shop.open('left', 'market')");
  await until(() => $g('#shop.show'), 3000, 'the market');
  tap($g('#shop .shop-tab[data-tab="sell"]')); await sleep(30);
  expect($g('#shop .shop-card[data-sell="gem-amber"]'), 'amber can be sold');
  tap($g('#shop [data-close]')); await sleep(30);
  G("Shop.open('left', 'bakery')");
  await until(() => $g('#shop.show'), 3000, 'the bakery');
  expect(!$g('#shop .shop-tab[data-tab="sell"]'), 'the bakery has no sell tab');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Shop: the warm roll costs 2 coins and gives 2 ember', async () => {
  await openWorldS();
  G("dispatch('hero.coins', 'left', { amount: 5 }); dispatch('hero.ember', 'left', { amount: -5 }); Shop.open('left', 'bakery')");
  await until(() => $g('#shop.show .shop-card[data-treat="warm-roll"]'), 3000, 'the roll');
  tap($g('#shop .shop-card[data-treat="warm-roll"]'));
  await until(() => G('S.heroes.left.ember') === 2, 3000, 'ember from the roll');
  expectEqual(G('S.heroes.left.coins'), 3, 'paid 2');
  expect(!G("S.heroes.left.inventory.includes('warm-roll')"), 'a treat is not an item');
  tap($g('#shop [data-close]')); await sleep(30);
});

test('Shop: with a math level set, paying is a make-change moment and exact change earns a bonus coin', async () => {
  await openWorldS();
  G("dispatch('settings.set', null, { mathLevel: { left: 2 } }); dispatch('hero.coins', 'left', { amount: 20 }); Shop.open('left', 'bakery')");
  await until(() => $g('#shop.show .shop-card[data-item="wand-twig"]'), 3000, 'the bakery');
  tap($g('#shop .shop-card[data-item="wand-twig"]'));
  await until(() => $g('.ch-card.math .m-coin.tray'), 3000, 'the make-change card');
  const answer = G("MathChallenge.active.left.answer");
  const trayValues = $$g('.ch-card.math .m-coin.tray').map(c => Number(c.dataset.c)).sort((a, b) => b - a);
  let left = answer;
  for (const v of trayValues) { while (left >= v) { tap($$g('.ch-card.math .m-coin.tray').find(c => Number(c.dataset.c) === v)); left -= v; await sleep(10); } }
  tap($g('.ch-card.math [data-give]'));
  await until(() => G("S.heroes.left.inventory.includes('wand-twig')"), 4000, 'the wand after paying');
  await until(() => G('S.heroes.left.coins') === 16, 3000, '20 minus 5 plus the bonus coin');
  tap($g('#shop [data-close]')); await sleep(30);
});

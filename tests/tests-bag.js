'use strict';
/* The Bag (Epic 4): equipping by tap and by drag, gear effects, crafting. */

async function openWorldG() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}

test('Bag: tap an item then a slot to wear it; the candle wand grows the Ember meter; tap the slot to take it off', async () => {
  await openWorldG();
  G("dispatch('hero.item', 'left', { item: 'wand-candle' }); dispatch('hero.item', 'left', { item: 'crown-paper' }); Menu.open('left', 'bag')");
  await until(() => $g('#menu .bag'), 2000, 'the bag');
  expect($g('#menu .bag .cell[data-item="wand-candle"] .fx').textContent.includes('+2 ember'), 'the effect is written in words');
  tap($g('#menu .bag .cell[data-item="wand-candle"]')); await sleep(40);
  expect($g('#menu .bag .cell[data-item="wand-candle"]').classList.contains('picked'), 'the card is picked');
  tap($g('#menu .bag .slot-head')); await sleep(40);
  expectEqual(G('S.heroes.left.equipped.hand'), undefined, 'the wrong slot does nothing');
  tap($g('#menu .bag .cell[data-item="wand-candle"]')); await sleep(40);
  tap($g('#menu .bag .slot-hand')); await sleep(60);
  expectEqual(G('S.heroes.left.equipped.hand'), 'wand-candle', 'the wand is in her hand');
  expectEqual(G('S.heroes.left.maxEmber'), 12, 'the Ember meter grew to 12');
  expect($g('#menu .bag .slot-hand').classList.contains('worn'), 'the slot shows it');
  tap($g('#menu .bag .slot-hand')); await sleep(60);
  expectEqual(G('S.heroes.left.equipped.hand'), null, 'tapping a worn slot takes it off');
  expectEqual(G('S.heroes.left.maxEmber'), 10, 'the meter is back to 10');
});

test('Bag: dragging a card onto its slot wears it', async () => {
  await openWorldG();
  G("dispatch('hero.item', 'right', { item: 'crown-daisy' }); Menu.open('right', 'bag')");
  await until(() => $g('#menu .bag'), 2000, 'the bag');
  const card = $g('#menu .bag .cell[data-item="crown-daisy"]'), slot = $g('#menu .bag .slot-head');
  const r1 = card.getBoundingClientRect(), r2 = slot.getBoundingClientRect();
  const ev = (type, x, y, target) => (target || W).dispatchEvent(new W.PointerEvent(type, { bubbles: true, pointerId: 2, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
  ev('pointerdown', r1.left + r1.width / 2, r1.top + r1.height / 2, card);
  await sleep(30);
  ev('pointermove', (r1.left + r2.left) / 2, (r1.top + r2.top) / 2); await sleep(30);
  ev('pointermove', r2.left + r2.width / 2, r2.top + r2.height / 2); await sleep(30);
  expect(W.document.querySelector('.cell.ghost'), 'a ghost card follows the finger');
  ev('pointerup', r2.left + r2.width / 2, r2.top + r2.height / 2); await sleep(80);
  expectEqual(G('S.heroes.right.equipped.head'), 'crown-daisy', 'dropped on the head slot: worn');
  expect(!W.document.querySelector('.cell.ghost'), 'the ghost is gone');
  expectEqual(G("gearEffects('right').hearts"), 1, 'the daisy crown adds a heart');
});

test('Bag: an item made for the other princess cannot be worn', async () => {
  await openWorldG();
  G("dispatch('hero.item', 'left', { item: 'wand-rose' }); Menu.open('left', 'bag')");
  await until(() => $g('#menu .bag'), 2000, 'the bag');
  const card = $g('#menu .bag .cell[data-item="wand-rose"]');
  expect(card.classList.contains('other') && card.querySelector('.fx').textContent.includes('Flower Girl'), 'the card says who it is for');
  tap(card); await sleep(40); tap($g('#menu .bag .slot-hand')); await sleep(40);
  expectEqual(G('S.heroes.left.equipped.hand'), undefined, 'Fire Girl cannot wear the rose wand');
  expect(G('Speech.log[Speech.log.length - 1]').includes('made for'), 'a kind line is spoken');
});

test('Bag: gearEffects sums every worn item', async () => {
  await openWorldG();
  G("dispatch('hero.equip', 'left', { slot: 'hand', item: 'wand-sunstone' }); dispatch('hero.equip', 'left', { slot: 'head', item: 'crown-moon' }); dispatch('hero.equip', 'left', { slot: 'feet', item: 'boots-mud' })");
  expectEqual(G("gearEffects('left')"), { maxEmber: 4, hearts: 1, reveal: 2, freeSpark: 0 }, 'sunstone 3+1 ember and a heart, moon crown reveal and ember, mud boots reveal');
  expectEqual(G('S.heroes.left.maxEmber'), 14, 'the meter is 10 + 4');
});

test('Bag: crafting uses up materials and makes the result; without them the button is greyed', async () => {
  await openWorldG();
  G("dispatch('hero.item', 'left', { item: 'charcoal' }); Bag.openCrafting('left')");
  await until(() => $g('#crafting .recipe'), 2000, 'the recipes');
  expect($$g('#crafting .recipe').some(r => r.dataset.recipe === 'ash-paint') && !$$g('#crafting .recipe').some(r => r.dataset.recipe === 'petal-dye'), 'Fire Girl sees her recipes and the shared ones, not Flower Girl\'s');
  expect(!$g('#crafting .recipe[data-recipe="ash-paint"] .btn').classList.contains('disabled'), 'ash paint can be made');
  expect($g('#crafting .recipe[data-recipe="lantern-paint"] .btn').classList.contains('disabled'), 'lantern paint cannot: missing materials');
  tap($g('#crafting .recipe[data-recipe="lantern-paint"] .btn')); await sleep(40);
  expect(!G('S.heroes.left.inventory.includes("lantern-paint")'), 'a greyed button makes nothing');
  tap($g('#crafting .recipe[data-recipe="ash-paint"] .btn')); await sleep(60);
  expectEqual(G('S.heroes.left.inventory'), ['ash-paint'], 'the charcoal became ash paint');
  expectEqual(G('S.heroes.left.collection["ash-paint"]'), 1, 'and it is in the collection');
  G("dispatch('hero.item', 'left', { item: 'petal-dye' })"); G("Bag.openCrafting('left')"); await sleep(40);
  tap($g('#crafting .recipe[data-recipe="lantern-paint"] .btn')); await sleep(60);
  expectEqual(G('S.heroes.left.inventory'), ['lantern-paint'], 'ash paint and petal dye became lantern paint');
  tap($g('#crafting [data-close]')); await sleep(30);
  expect(!$g('#crafting.show'), 'closed');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

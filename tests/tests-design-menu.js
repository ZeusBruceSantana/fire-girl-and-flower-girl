'use strict';
/* Phase C, menus, empty states, item icons and the Lair room. Every test name starts "Design:". */

async function openWorldDM(extra) {
  const save = readySave();
  if (extra) extra(save);
  await openGame(save);
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
const gemSvg = () => G('ART.gem');
const menuText = () => $g('#menu .page').textContent;

test('Design: item pictures come from the category icons, never the one grey diamond', async () => {
  await openWorldDM();
  G("['wand-twig', 'crown-paper', 'cape-wool', 'boots-mud', 'seed-sun', 'charcoal', 'ash-paint', 'gem-amber', 'book-small-magic'].forEach(item => dispatch('hero.item', 'left', { item }))");
  for (const tab of ['bag', 'collection']) {
    G(`Menu.open('left', '${tab}')`);
    await until(() => $g('#menu .page-' + tab + ' .cell'), 2000, 'the ' + tab);
    expect(!$g('#menu').innerHTML.includes(gemSvg()), 'no diamond placeholder in the ' + tab);
    for (const cell of $$g('#menu .page-' + tab + ' .cell[data-item]')) expect(cell.querySelector('.ico.item-ico'), cell.dataset.item + ' has a category icon in the ' + tab);
    G('Menu.close()'); await sleep(30);
  }
  const cats = G("['wand-twig', 'crown-paper', 'charcoal', 'ash-paint', 'gem-amber'].map(id => itemCategory(ITEMS.find(i => i.id === id)))");
  expectEqual(cats, ['wand', 'crown', 'material', 'paint', 'gem'], 'materials and paints get their own silhouettes');
  expect(G("ITEMS.every(i => ITEM_ICONS[itemCategory(i)])"), 'every item has an icon');
});

test('Design: every shop card shows a category icon, and an unaffordable price stays readable', async () => {
  await openWorldDM();
  for (const id of ['bakery', 'market']) {
    G(`Shop.open('left', '${id}')`);
    await until(() => $g('#shop.show .shop-card'), 3000, 'the ' + id);
    for (const card of $$g('#shop .shop-card')) expect(card.querySelector('.art .ico'), (card.dataset.item || card.dataset.treat) + ' has an icon');
    expect(!$g('#shop').innerHTML.includes(gemSvg()), 'no diamond in the ' + id);
    G('Shop.close()'); await sleep(30);
  }
  G("Shop.open('left', 'market')");
  await until(() => $g('#shop .shop-card.poor'), 3000, 'a card she cannot afford');
  const price = $g('#shop .shop-card.poor .price');
  expect(parseFloat(W.getComputedStyle(price).opacity) === 1 && !W.getComputedStyle($g('#shop .shop-card.poor')).filter.includes('grayscale'), 'the price is not greyed out');
  const tab = $g('#shop .shop-tab[data-tab="buy"]').getBoundingClientRect(), page = $g('#shop .shop-tabs').getBoundingClientRect();
  G('Shop.close()'); await sleep(30);
  G("Shop.open('left', 'bakery')"); await until(() => $g('#shop.show .shop-tab'), 2000, 'the bakery');
  const alone = $g('#shop .shop-tab[data-tab="buy"]').getBoundingClientRect();
  expect(alone.width < page.width / 3 && Math.abs(alone.width - tab.width) < 4, 'a Buy tab on its own is not stretched across the page');
  expectEqual(W.getComputedStyle($g('#shop .shop-portrait')).borderTopLeftRadius, '50%', 'the keeper sits in the round medallion');
  G('Shop.close()'); await sleep(30);
});

test('Design: day one, no menu tab is a wall of question marks', async () => {
  await openWorldDM();
  for (const tab of ['spellbook', 'bag', 'collection', 'journal', 'map', 'badges', 'friends']) {
    G(`Menu.open('left', '${tab}')`);
    await until(() => $g('#menu .page-' + tab), 2000, 'the ' + tab);
    await sleep(20);
    const q = (menuText().match(/\?/g) || []).length;
    expectEqual(q, 0, 'question marks on the ' + tab + ' page');
    G('Menu.close()'); await sleep(20);
  }
  G("Menu.open('left', 'collection')"); await until(() => $g('#menu .page-collection'), 2000, 'the book');
  expect($$g('#menu .cell.silhouette').length <= G('BOOK_PEEK'), 'the Book shows only a few silhouettes of what is next');
  expect($$g('#menu .cell.silhouette .ico.rarity-unknown').length === $$g('#menu .cell.silhouette').length, 'each unknown thing is its own silhouette');
  G('Menu.close()'); await sleep(20);
  G("Lair.open('left', 'scrolls')"); await sleep(40);
  expect(!/\?/.test($g('#lair').textContent), 'no question marks on the bookshelf');
  G('Lair.close()'); await sleep(20);
});

test('Design: the Journal tells the story in sentences and never shows a raw flag id', async () => {
  await openWorldDM(s => Object.assign(s.shared.flags, { 'visited-dorm': true, 'visited-map-school-grounds': true, 'took-chest-1': true, 'story-e-arrives': true,
    'met-electric': true, 'gap-found': true, 'case-missing-pie-open': true, 'case-missing-pie-solved': true, 'some-future-flag': true }));
  G("Menu.open('left', 'journal')");
  await until(() => $g('#menu .page-journal .journal'), 2000, 'the journal');
  const text = menuText();
  for (const raw of ['visited-', 'took-', 'story-', 'case-missing', 'some-future-flag', 'met-electric', 'gap-found'])
    expect(!text.includes(raw), 'no raw "' + raw + '" in the Journal');
  expect(text.includes(G("WORLD.ui.flags['met-electric']")), 'a story flag shows as its sentence');
  expect(text.includes('The Missing Pie'), 'a solved case is told by name');
  G('Menu.close()'); await sleep(20);
});

test('Design: the Map tab draws a trail of places, lit where she has been, and marks where she is', async () => {
  await openWorldDM();
  G("Menu.open('left', 'map')");
  await until(() => $g('#menu .page-map .worldmap'), 2000, 'the map');
  expect($$g('#menu .worldmap svg path.trail').length === G('Object.keys(MAPS).length') - 1, 'a path joins every place in order');
  expectEqual($$g('#menu .map-node').length, G('Object.keys(MAPS).length'), 'one stop per place');
  expectEqual($$g('#menu .map-node.here').length, 1, 'exactly one place is marked "you are here"');
  expect($g('#menu .map-node.here').classList.contains('seen'), 'and it is lit');
  expect($$g('#menu .map-node.fog').length >= 1, 'places not visited yet wait in the fog');
  for (const n of $$g('#menu .map-node.fog')) expectEqual(n.querySelector('.word').textContent, '', 'a foggy place has no name yet');
  G('Menu.close()'); await sleep(20);
});

test('Design: the Badges tab is a wall with dim medal slots, the earned ones shining', async () => {
  await openWorldDM();
  G("dispatch('hero.badge', 'left', { badge: 'first-case' }); Menu.open('left', 'badges')");
  await until(() => $g('#menu .badge-wall'), 2000, 'the badge wall');
  expect($g('#menu .badge-wall .cell.got .ico.badge-ico'), 'an earned badge is a gold medal');
  for (const c of $$g('#menu .badge-wall .cell.silhouette')) {
    expect(c.querySelector('.ico.rarity-unknown'), 'a slot not earned is a dim medal');
    expectEqual(c.textContent.trim(), '', 'and says nothing yet');
  }
  G('Menu.close()'); await sleep(20);
});

test('Design: the Lantern is the Lair itself: a ghost per upgrade in its place, one card per tap', async () => {
  await openWorldDM();
  G("dispatch('hero.hearts', 'left', { amount: 4 })");
  G("Lair.open('left', 'upgrades')");
  await until(() => $g('#lair .lair-room'), 2000, 'the room');
  expect($$g('#lair .room-pic img').length >= 1, 'the Lair picture is behind the spots');
  expectEqual($$g('#lair .lair-spot').length, G('LAIR.upgrades.length'), 'one spot per upgrade');
  expect(G('LAIR.upgrades.every(u => Array.isArray(u.at) && u.at.length === 2)'), 'every upgrade has its place in the data');
  const room = $g('#lair .lair-room').getBoundingClientRect();
  for (const s of $$g('#lair .lair-spot')) {
    const r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    expect(cx >= room.left && cx <= room.right && cy >= room.top && cy <= room.bottom, s.dataset.up + ' sits inside the room');
    expect(r.width >= 40 && r.height >= 40, s.dataset.up + ' is big enough to tap');
  }
  expect($g('#lair .lair-spot.owned') && $g('#lair .lair-spot.buyable') && $g('#lair .lair-spot.locked'), 'owned, buyable and not-yet spots all show');
  expectEqual($$g('#lair .lair-card').length, 0, 'no price list: no cards until a spot is tapped');
  tap($g('#lair .lair-spot[data-up="lantern"]')); await sleep(30);
  expectEqual($$g('#lair .lair-card').length, 1, 'one card opens');
  const card = $g('#lair .lair-card[data-up="lantern"]');
  expect(card.querySelector('[data-buy].btn.primary'), 'with a Buy button from the one family');
  const full = G("LAIR.upgrades.find(u => u.id === 'lantern').about");
  expect(card.querySelector('.lc-about').textContent.length < full.length, 'the card keeps its line short');
  tap($g('#lair .lair-spot[data-up="radio"]')); await sleep(30);
  expectEqual($$g('#lair .lair-card').length, 1, 'tapping another spot swaps the card, still one');
  G('Lair.close()'); await sleep(20);
});

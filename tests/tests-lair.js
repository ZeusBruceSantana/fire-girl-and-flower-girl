'use strict';
/* The Lair stations (Epic 6): upgrades, gallery, inviting friends, scrolls, and the Badges tab. */

async function openWorldL() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}

test('Lair upgrades: the lantern lists cards and buying with the fund works', async () => {
  await openWorldL();
  G("dispatch('hero.hearts', 'left', { amount: 10 })");           // half goes to the fund
  expectEqual(G('S.shared.lair.fund'), 5, 'ten hearts earned, five in the fund');
  G("Lair.open('left', 'upgrades')");
  await until(() => $$g('#lair .lair-card').length > 0, 2000, 'upgrade cards');
  expectEqual($$g('#lair .lair-card').length, G('LAIR.upgrades.length'), 'one card per upgrade');
  expect($g('#lair .lair-card[data-up="cushions"].owned'), 'the cushions are ours from the start');
  expect($g('#lair .lair-card[data-up="lantern"].buyable [data-buy]'), 'the lantern (3 hearts) can be bought with 5');
  expect($g('#lair .lair-card[data-up="case-board"].locked'), 'the case board needs the lantern first');
  tap($g('#lair [data-buy="lantern"]'));
  await sleep(50);
  expect(G('S.shared.lair.upgrades.includes("lantern")'), 'the lantern is ours');
  expectEqual(G('S.shared.lair.fund'), 2, 'the fund dropped by 3');
  expect($g('#lair .lair-card[data-up="lantern"].owned'), 'the card shows owned');
  tap($g('#lair [data-close]')); await sleep(30);
  expect(!$g('#lair.show'), 'closed');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('Lair stations that are not bought yet say what to buy', async () => {
  await openWorldL();
  G("Lair.open('left', 'gallery')");
  await until(() => $g('#lair .lair-note.big'), 2000, 'the gate note');
  expect($g('#lair .lair-note.big').textContent.includes('gallery wall'), 'it names the gallery wall');
  expect($g('#lair .lair-card[data-up="gallery"]'), 'and offers the card right there');
  tap($g('#lair [data-close]')); await sleep(30);
});

test('Lair invite: a level-3 friend can visit for 2 hearts, once a day', async () => {
  await openWorldL();
  G("dispatch('lair.upgrade', 'left', { id: 'lantern', hearts: 0 }); dispatch('lair.upgrade', 'left', { id: 'snack-corner', hearts: 0 }); dispatch('lair.upgrade', 'left', { id: 'guest-cushion', hearts: 0 })");
  G("dispatch('hero.hearts', 'left', { amount: 8, friend: 'ice' })");
  G("Lair.open('left', 'invite')");
  await until(() => $$g('#lair .lair-friend').length > 0, 2000, 'friends');
  expect($g('#lair .lair-friend[data-f="ice"].can [data-invite]'), 'the Ice princess (8 hearts, level 3) can be invited');
  expect($g('#lair .lair-friend[data-f="wind"].notyet'), 'a friend with no hearts cannot');
  const before = G('S.heroes.left.hearts');
  tap($g('#lair [data-invite="ice"]'));
  await sleep(60);
  expect(G('S.shared.flags["visit-ice-day-1"]'), 'the visit flag is set');
  expectEqual(G('S.heroes.left.hearts'), before - 2, 'two hearts spent');
  expectEqual(G('S.shared.counters["visit-bonus-day"]'), 1, 'the bonus day is recorded');
  await until(() => $g('.dlg'), 2000, 'she says hello');
  G('Dialogue.close()'); await sleep(30);
  expect($g('#lair .lair-friend[data-f="ice"].here'), 'she is here today, no second invite');
  tap($g('#lair [data-close]')); await sleep(30);
});

test('Lair scrolls: silhouettes until a myth is read, then a real scroll', async () => {
  await openWorldL();
  G("dispatch('lair.upgrade', 'left', { id: 'lantern', hearts: 0 }); dispatch('lair.upgrade', 'left', { id: 'bookshelf', hearts: 0 })");
  G("Lair.open('left', 'scrolls')");
  await until(() => $$g('#lair .scroll').length > 0, 2000, 'scrolls');
  expectEqual($$g('#lair .scroll.silhouette').length, G('MYTHS.length'), 'all silhouettes at first');
  G("dispatch('hero.scroll', 'left', { myth: 'persephone' }); Lair.render()");
  await sleep(30);
  expect($g('#lair .scroll[data-m="persephone"].got [data-read]'), 'the Persephone scroll is real now');
  expectEqual($$g('#lair .scroll.silhouette').length, G('MYTHS.length') - 1, 'the rest stay silhouettes');
  tap($g('#lair [data-close]')); await sleep(30);
});

test('Lair badges tab shows earned badges in color and the rest as silhouettes', async () => {
  await openWorldL();
  G("dispatch('hero.badge', 'left', { badge: 'first-case' })");
  G("Menu.open('left', 'badges')");
  await until(() => $g('#menu .page-badges .cell'), 2000, 'the badges wall');
  expectEqual($$g('#menu .page-badges .cell.got').length, 1, 'one earned');
  expectEqual($$g('#menu .page-badges .cell.silhouette').length, G('Object.keys(BADGES).length') - 1, 'the rest silhouettes');
  expect($g('#menu .page-badges .lair-note').textContent.includes('1 of'), 'a count at the top');
  tap($g('#menu [data-close]')); await sleep(30);
});

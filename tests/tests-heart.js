'use strict';
/* The Pure of Heart test, weather, and the collection book. */
test('Coming back through the gap the first time brings the Headmistress and the Pure of Heart test', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  G("stageGo('map:school-grounds', { from: 'map:whispering-woods' })");
  await until(() => $g('.dlg') && $g('.dlg .plate') && $g('.dlg .plate').textContent.includes('Headmistress'), 10000, 'the Headmistress');
  for (let i = 0; i < 14 && !G('S.shared.flags["secret-safe"]'); i++) {
    if ($g('.dlg .choices.show')) { const choices = $$g('.dlg .choice'); tap(choices[choices.length - 1]); await sleep(60); if ($g('.dlg') && !$g('.dlg .choices.show')) await tapNext(); if ($g('.dlg .choices.show')) { tap($$g('.dlg .choice')[0]); await sleep(60); } }
    else if ($g('.dlg')) await tapNext();
    await sleep(60);
  }
  await until(() => G('S.shared.flags["secret-safe"]'), 6000, 'the secret to be safe');
  expect(G('S.heroes.left.badges.includes("pure-of-heart")') && G('S.heroes.right.badges.includes("pure-of-heart")'), 'both have the badge');
  expectEqual(G('S.shared.counters["pure-of-heart"]'), 1, 'counted once');
  G("stageGo('map:school-grounds', { from: 'map:whispering-woods' })"); await sleep(300);
  expect(!$g('.dlg') || !$g('.dlg .plate').textContent.includes('Headmistress'), 'not again the same day');
});

test('Weather cycles by day and gives the matching hero extra ember at wake', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title')); await until(() => G('scene') === 'world', 2000, 'the world');
  expectEqual(G('Day.weather()'), 'sun', 'day 1 is sunny');
  G("Day.onThing('left', { action: 'sleep' })"); await sleep(60); await tapNext(); await sleep(60); await tapNext();
  await until(() => G('Day.part') === 'period1', 3000, 'the day to start');
  expectEqual(G('S.heroes.left.ember'), 7, 'Fire Girl got 2 ember from the sunny day');
  expectEqual(G('S.heroes.right.ember'), 5, 'Flower Girl did not');
});

test('The collection book shows found items and silhouettes, and sets fill up', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title')); await until(() => G('scene') === 'world', 2000, 'the world');
  G("dispatch('hero.item', 'left', { item: 'wand-twig' }); dispatch('hero.item', 'left', { item: 'crown-paper' }); Menu.open('left', 'collection')");
  await until(() => $g('#menu .page-collection'), 2000, 'the book');
  expectEqual($$g('#menu .cell.got').length, 2, 'two found');
  expectEqual($$g('#menu .cell.silhouette').length, G('BOOK_PEEK'), 'a few of the rest wait as silhouettes');
  expect($g('#menu .page-collection .more'), 'and a line says how many more are out there');
  expect($$g('#menu .set').some(s => s.textContent.includes('School') && s.textContent.includes('2 / 3')), 'the School set shows 2 of 3');
  tap($g('#menu [data-close]'));
});

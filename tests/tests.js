'use strict';
/* The tests. Each one opens the game fresh with a pretend save, does something, and checks what happened.
   Epic 0: just enough to prove the pipeline (page loads, saves are isolated, content files are sound). */

test('The title screen opens and shows both princesses', async () => {
  await openGame(null);
  expectEqual(G('scene'), 'title', 'the game opens on the title screen');
  expectEqual($g('#game-title').textContent, G('WORLD.title'), 'the title comes from data/world.js');
  expect($g('#name-left').textContent.length > 0, 'the left hero has a name');
  expect($g('#name-right').textContent.length > 0, 'the right hero has a name');
  expect($g('#art-left svg') && $g('#art-right svg'), 'both heroes have a picture');
});

test('In test mode the game uses its own save, never the real one', async () => {
  await openGame(null);
  expectEqual(G('SAVE_KEY'), 'ember-bloom-test-save', 'the save key is the test one');
  G('S.heroes.left.coins = 7; save();');
  await sleep(400);
  expectEqual(saved().heroes.left.coins, 7, 'a change was written to the test save');
  expect(localStorage.getItem('ember-bloom-save-v1') === null, 'the real save was not touched');
});

test('Progress is still there after closing and opening the game', async () => {
  await openGame(null);
  G(`S.heroes.left.kind = 'fire'; S.heroes.left.level = 3; S.heroes.right.kind = 'flower';
     S.heroes.right.inventory.push('wand-twig'); S.shared.unlockedAreas.push('orchard'); saveNow();`);
  const before = clone(G('S'));
  await reopenGame();
  const after = G('S');
  expectEqual(after.heroes, before.heroes, 'both heroes came back the same');
  expectEqual(after.shared, before.shared, 'the shared world came back the same');
});

test('A damaged save does not break the game', async () => {
  await openGame('{ this is not a save');
  expectEqual(G('scene'), 'title', 'the game still opens (as a new game)');
  expect(localStorage.getItem('ember-bloom-test-save-damaged'), 'the damaged save was set aside, not thrown away');
});

test('Every quest, area and item points at things that exist', async () => {
  await openGame(null);
  const problems = G(`(() => {
    const out = [];
    const itemIds = new Set(ITEMS.map(i => i.id)), questIds = new Set(QUESTS.map(q => q.id));
    const spellIds = new Set([...WORLD.heroes.fire.spells, ...WORLD.heroes.flower.spells, ...WORLD.balance.togetherSpells].map(s => s.id));
    const seen = new Set();
    for (const i of ITEMS) { if (seen.has(i.id)) out.push('duplicate item ' + i.id); seen.add(i.id); if (!RARITY[i.rarity]) out.push(i.id + ' has unknown rarity ' + i.rarity); }
    for (const a of AREAS) {
      for (const q of a.quests) if (!questIds.has(q)) out.push('area ' + a.id + ' lists missing quest ' + q);
      for (const f of a.finds) if (!itemIds.has(f)) out.push('area ' + a.id + ' lists missing item ' + f);
    }
    for (const q of QUESTS) {
      if (!WORLD.people[q.giver]) out.push('quest ' + q.id + ' has unknown giver ' + q.giver);
      if (!AREAS.some(a => a.id === q.area)) out.push('quest ' + q.id + ' is in unknown area ' + q.area);
      if (q.reward.item && !itemIds.has(q.reward.item)) out.push('quest ' + q.id + ' rewards missing item ' + q.reward.item);
      for (const s of q.steps) {
        if (s.challenge && !CHALLENGES[s.challenge]) out.push('quest ' + q.id + ' uses unknown challenge ' + s.challenge);
        if (s.spell && !spellIds.has(s.spell)) out.push('quest ' + q.id + ' casts unknown spell ' + s.spell);
      }
    }
    for (const s of Object.values(ITEM_SETS)) for (const i of s.items) if (!itemIds.has(i)) out.push('set lists missing item ' + i);
    const odds = Object.values(WORD_BOXES.pickOdds).reduce((a, b) => a + b, 0);
    if (Math.abs(odds - 1) > 0.001) out.push('WORD_BOXES.pickOdds add up to ' + odds + ', not 1');
    return out;
  })()`);
  expectEqual(problems, [], 'content problems');
});

'use strict';
/* The tests. Each one opens the game fresh with a pretend save, does something, and checks what happened.
   Epic 0.5: the state rules (actions, merging, replay), saving, two pretend devices, the content files,
   and the stage (scenes load, heroes walk, hotspots travel). */

/* =====================================================================
   OPENING, SAVING, LOADING
   ===================================================================== */
test('A brand-new game asks each girl to pick a princess and a color', async () => {
  await openGame(null);
  await until(() => G('scene') === 'pick', 10000, 'the picking screen');
  tap($g('.pick-half[data-seat="left"] .pick-card[data-kind="fire"]'));
  await sleep(100);
  tap($g('.pick-half[data-seat="right"] .pick-card[data-kind="fire"]'));      // already taken by her sister
  expectEqual(G('picking.right.kind'), null, 'the same princess as her sister cannot be picked');
  tap($g('.pick-half[data-seat="right"] .pick-card[data-kind="flower"]'));
  await sleep(100);
  tap($g('.pick-half[data-seat="right"] .swatch[data-color="orange"]'));      // Fire Girl's default color, taken
  expect(G('picking.right.color') !== 'orange', 'the same color as her sister cannot be picked');
  tap($g('.pick-half[data-seat="right"] .swatch[data-color="pink"]'));
  await sleep(100);
  tap($g('.pick-half[data-seat="left"] [data-go]'));
  await sleep(200);
  tap($g('.pick-half[data-seat="right"] [data-go]'));
  await until(() => G('scene') === 'intro', 5000, 'the school story');
  for (let i = 0; i < 10 && G('scene') === 'intro'; i++) { tap($g('.bubble .bigbtn.next')); await sleep(150); }
  await until(() => G('scene') === 'world', 5000, 'the world');
  const S = G('S');
  expectEqual([S.heroes.left.kind, S.heroes.left.color, S.heroes.right.kind, S.heroes.right.color], ['fire', 'orange', 'flower', 'pink'], 'choices saved');
  expect(S.heroes.left.joined && S.heroes.right.joined, 'both joined');
  expect(S.shared.flags['intro-seen'], 'the story is marked as seen');
  expectEqual(saved().heroes.left.kind, 'fire', 'written to the save');
});

test('The title opens over the Academy gate with three princesses', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  expectEqual($g('#game-title').textContent, G('WORLD.title'), 'the title comes from data/world.js');
  expectEqual(G('document.body.dataset.place'), 'academy-gate', 'the gate scene is behind the title');
  expectEqual(G("Object.values(Stage.heroes).filter(h => h.visible).length"), 3, 'three heroes on the stage (two players and the companion)');
  expect(G("Object.keys(Stage.layers).length") === 4, 'the four painted layers loaded');
});

test('In test mode the game uses its own save, never the real one', async () => {
  await openGame(null);
  expectEqual(G('SAVE_KEY'), 'ember-bloom-test-save', 'the save key is the test one');
  G("dispatch('hero.coins', 'left', { amount: 7 })");
  await sleep(400);
  expectEqual(saved().heroes.left.coins, 7, 'a change was written to the test save');
  expect(localStorage.getItem('ember-bloom-save-v1') === null, 'the real save was not touched');
});

test('Progress is still there after closing and opening the game', async () => {
  await openGame(null);
  G(`dispatch('hero.setup', 'left', { kind: 'fire', color: 'orange' }); dispatch('hero.xp', 'left', { amount: 50 });
     dispatch('hero.item', 'right', { item: 'wand-twig' }); dispatch('area.unlock', 'left', { area: 'orchard' }); dispatch('flag.set', 'left', { flag: 'tunnel-found' }); saveNow();`);
  const before = clone(G('S'));
  expectEqual(before.heroes.left.level, 2, '50 xp is level 2');
  await reopenGame();
  const after = G('S');
  expectEqual(after.heroes, before.heroes, 'all three heroes came back the same');
  expectEqual(after.shared, before.shared, 'the shared world came back the same');
  expectEqual(after.settings.deviceId, before.settings.deviceId, 'the device id is kept');
});

test('A damaged save does not break the game', async () => {
  await openGame('{ this is not a save');
  await until(() => G('scene') === 'pick', 10000, 'the picking screen (a new game)');
  expect(localStorage.getItem('ember-bloom-test-save-damaged'), 'the damaged save was set aside, not thrown away');
});

test('A save from version 1 still loads, with the new fields added', async () => {
  const v1 = { version: 1, heroes: { left: { name: '', kind: 'fire', level: 3, xp: 150, coins: 9, inventory: ['wand-twig'], words: ['cat', 'ship'] }, right: { kind: 'flower', level: 1, xp: 0, coins: 0, inventory: [] } },
               shared: { unlockedAreas: ['town', 'school'], town: {}, flags: {} }, settings: { sound: { muted: true, volume: 0.5, music: true }, readAloud: true, parentPin: null, firstRun: false } };
  await openGame(v1);
  const S = G('S');
  expectEqual(S.version, 2, 'version bumped');
  expectEqual(S.heroes.left.level, 3, 'level kept'); expectEqual(S.heroes.left.inventory, ['wand-twig'], 'inventory kept'); expectEqual(S.heroes.left.words, ['cat', 'ship'], 'words kept');
  expect(S.heroes.away && S.heroes.away.level === 1, 'the away seat was added');
  expectEqual(S.shared.unlockedAreas, ['town', 'school'], 'areas kept');
  expect(S.shared.counters && S.shared.lair && S.log, 'new shared fields exist');
  expectEqual(S.settings.sound.muted, true, 'settings kept');
  expectEqual(S.settings.localSeats, ['left', 'right'], 'new settings have defaults');
});

/* =====================================================================
   THE STATE RULES
   ===================================================================== */
test('An action applied twice changes nothing the second time', async () => {
  await openGame(null);
  const r = G(`(() => { const a = makeAction(S, 'hero.coins', 'left', { amount: 5 }); const s1 = apply(S, a); const s2 = apply(s1, a); return [s1.heroes.left.coins, s2.heroes.left.coins, s1 === s2]; })()`);
  expectEqual(r, [5, 5, true], 'coins 5, still 5, same state object');
});

test('The game cannot write into S directly in test mode', async () => {
  await openGame(null);
  const threw = G(`(() => { 'use strict'; try { S.heroes.left.coins = 99; return false; } catch (e) { return true; } })()`);
  expect(threw, 'assigning into S throws (it is frozen), so stray writes fail tests');
  expectEqual(G('S.heroes.left.coins'), 0, 'and nothing changed');
});

test('A hero can only be changed by the device that owns her seat', async () => {
  await openGame(null);
  const r = G(`(() => {
    const s0 = structuredClone(S); s0.settings.seatOwners.right = 'someone-else';
    const mine = Object.assign(makeAction(s0, 'hero.coins', 'right', { amount: 5 }), { dev: 'me' });
    const theirs = Object.assign(makeAction(s0, 'hero.coins', 'right', { amount: 5 }), { dev: 'someone-else', id: 'x-1' });
    const npc = Object.assign(makeAction(s0, 'hero.coins', 'right', { amount: 5 }), { dev: 'me', id: 'x-2', byNpc: true });
    return [apply(s0, mine).heroes.right.coins, apply(s0, theirs).heroes.right.coins, apply(s0, npc).heroes.right.coins];
  })()`);
  expectEqual(r, [0, 5, 5], 'ignored from a stranger, applied from the owner, allowed for the companion');
});

test('The shared world ends up the same whatever order the actions arrive in', async () => {
  await openGame(null);
  const r = G(`(() => {
    const acts = [];
    const mk = (type, hero, payload, i) => ({ id: 'd' + (i % 3) + '-' + i, t: 1000 + i, dev: 'd' + (i % 3), hero, type, payload });
    for (let i = 0; i < 30; i++) {
      const k = i % 6;
      acts.push(k === 0 ? mk('flag.set', 'left', { flag: 'f' + (i % 4) }, i)
        : k === 1 ? mk('counter.max', 'right', { key: 'friend-ice', value: i }, i)
        : k === 2 ? mk('event.add', 'left', { what: 'e' + i }, i)
        : k === 3 ? mk('area.unlock', 'away', { area: 'a' + (i % 3) }, i)
        : k === 4 ? mk('case.clue', 'left', { case: 'missing-pie', clue: 'c' + (i % 3) }, i)
        : mk('lair.upgrade', 'right', { id: 'u' + (i % 2), hearts: 0 }, i));
    }
    const run = order => { let s = freshSave(); s.settings.deviceId = 'd0'; for (const a of order) s = apply(s, a); return s.shared; };
    const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v);
    const a = run(acts), b = run([...acts].reverse()), c = run([...acts].sort(() => Math.random() - 0.5));
    return [canon(a) === canon(b), canon(a) === canon(c), a.counters['friend-ice'], a.events.length, a.unlockedAreas.length];
  })()`);
  expectEqual(r.slice(0, 2), [true, true], 'forward, reversed and shuffled give the same shared world');
  expectEqual(r[2], 25, 'the counter kept the biggest value');
  expectEqual(r[3], 5, 'every event kept once');
  expectEqual(r[4], 2, 'town plus the one area those actions unlock');
});

test('Merging two copies of the shared world loses nothing', async () => {
  await openGame(null);
  const r = G(`(() => {
    const a = freshSave().shared, b = freshSave().shared;
    a.flags.x = true; b.flags.y = true; a.counters.k = 3; b.counters.k = 5; a.events.push({ id: 'e1', t: 1 }); b.events.push({ id: 'e2', t: 2 }); b.events.push({ id: 'e1', t: 1 });
    b.lair.upgrades.push('lantern'); a.cases.pie = { clues: ['c1'], solvedBy: ['left'] }; b.cases.pie = { clues: ['c2'], solvedBy: ['away'] }; b.clock.day = 4;
    const m = mergeShared(a, b);
    return [m.flags.x && m.flags.y, m.counters.k, m.events.length, m.lair.upgrades.includes('lantern'), m.cases.pie.clues.length, m.cases.pie.solvedBy.length, m.clock.day];
  })()`);
  expectEqual(r, [true, 5, 2, true, 2, 2, 4], 'flags OR, counters max, events union, upgrades union, cases union, clock max');
});

test('Words a hero misses drop to box 0 and first-try wins climb', async () => {
  await openGame(null);
  G(`dispatch('hero.word', 'left', { word: 'ship', right: true, firstTry: true }); dispatch('hero.word', 'left', { word: 'ship', right: true, firstTry: true }); dispatch('hero.word', 'left', { word: 'cat', right: false });`);
  const st = G('S.heroes.left.wordStats');
  expectEqual([st.ship.box, st.ship.right, st.cat.box, st.cat.wrong], [3, 2, 0, 1], 'ship climbed to box 3, cat fell to box 0');
});

/* =====================================================================
   TWO PRETEND DEVICES (the cousin's device, or a twin's own tablet)
   ===================================================================== */
test('A second device sees actions from the first, once, even after being offline', async () => {
  await openTwoDevices();
  G("dispatch('flag.set', 'left', { flag: 'from-a' })");
  await until(() => G2('S.shared.flags["from-a"]'), 4000, 'device B to see the flag from A');
  G2('NET.goOffline()');
  G2("dispatch('counter.max', 'away', { key: 'friend-ice', value: 4 }); dispatch('flag.set', 'away', { flag: 'from-b-offline' })");
  await sleep(300);
  expect(!G('S.shared.flags["from-b-offline"]'), 'A has not seen it yet (B is offline)');
  G2('NET.goOnline()');
  await until(() => G('S.shared.flags["from-b-offline"]') && G('S.shared.counters["friend-ice"]') === 4, 4000, 'A to receive what B did offline');
  await sleep(300);
  expectEqual(G('S.shared.events.length'), 0, 'no duplicates: nothing was applied twice');
  expectEqual(G('outboxAll().length') + G2('outboxAll().length'), 0, 'both outboxes were acknowledged and emptied');
});

test('The companion drives the cousin until her real device joins', async () => {
  await openTwoDevices();
  await until(() => G('P.away.driver') === 'npc' || G('P.away.driver') === 'player', 3000, 'presence for the away seat');
  G2("setPresence('away', { scene: 'academy-gate', x: 900, anim: 'idle' })");
  await until(() => G('P.away.driver') === 'player', 4000, 'A to hand the away seat to the real player');
  expectEqual(G("S.settings.seatOwners.away"), 'b', 'device B now owns the away seat');
});

/* =====================================================================
   JOIN, LEAVE, THE GROWN-UP CORNER
   ===================================================================== */
test('A girl can leave and the companion walks her hero along; Join brings her back', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  expect($g('.seatbtn.seat-right.joined'), 'the right seat shows Bye for now');
  tap($g('.seatbtn.seat-right .byebtn'));
  await sleep(100);
  expectEqual(G('S.heroes.right.joined'), false, 'she left');
  expect($g('.seatbtn.seat-right.empty .bigbtn.join'), 'a big Join button appears on her side');
  G("onTap({ seat: 'right', x: 400, y: 800, hotspot: null })");
  await sleep(100);
  expectEqual(G('Stage.heroes.right.target'), null, 'taps on her side do nothing while she is away');
  G("onTap({ seat: 'left', x: 1280, y: 800, hotspot: SCENES['academy-gate'].hotspots[0] })");
  await until(() => G('document.body.dataset.place') === 'dorm', 8000, 'the dorm');
  await until(() => G('P.right.scene') === 'dorm' && G('P.right.driver') === 'npc', 5000, 'the companion to bring her hero along');
  tap($g('.seatbtn.seat-right .bigbtn.join'));
  await sleep(150);
  expectEqual(G('S.heroes.right.joined'), true, 'she is back');
  expectEqual(G('S.heroes.left.coins'), 0, 'nothing changed for her sister');
});

test('The grown-up corner saves names, words, settings and a PIN, on the device only', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  G('parentOpen()');
  await until(() => G('scene') === 'parent', 2000, 'the parent screen');
  $g('[data-name="left"]').value = 'Twin A';
  $g('[data-words="left"]').value = 'cat\nShip \n\nfrog';
  $g('[data-words="right"]').value = 'sun, bed';
  $g('[data-math="right"]').value = '2';
  $g('[data-set="classLength"]').value = 'short';
  $g('[data-set="readToGrownUp"]').checked = true;
  $g('[data-pin]').value = '1234';
  tap($g('[data-close]'));
  await sleep(400);
  const S = G('S');
  expectEqual(S.heroes.left.name, 'Twin A', 'name saved');
  expectEqual(S.heroes.left.words, ['cat', 'ship', 'frog'], 'words cleaned and saved');
  expectEqual(S.heroes.right.words, ['sun', 'bed'], 'commas work too');
  expectEqual([S.settings.mathLevel.right, S.settings.classLength, S.settings.readToGrownUp, S.settings.parentPin], [2, 'short', true, '1234'], 'settings saved');
  expectEqual(G('Stage.heroes.left.label'), 'Twin A', 'her name shows over her head');
  expect(!G('outboxAll().some(a => a.type === "settings.set")'), 'settings never go in the outbox (device only)');
  G('parentGate()');
  await sleep(100);
  expect($g('#p-pin'), 'with a PIN set, the corner asks for it');
  $g('#p-pin').value = '9999'; tap($g('[data-ok]')); await sleep(100);
  expect($g('#p-pin'), 'a wrong PIN stays on the PIN screen');
  $g('#p-pin').value = '1234'; tap($g('[data-ok]')); await sleep(100);
  expect($g('[data-name="left"]'), 'the right PIN opens the corner');
  tap($g('[data-close]')); await sleep(100);
});

test('A family world code and the cousin link can be made in the grown-up corner', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  G('parentOpen()');
  tap($g('[data-makeworld]'));
  await sleep(200);
  const code = G('S.settings.worldCode');
  expect(code && code.length === 24, 'a 24-letter code was made');
  expect($g('[data-copylink]'), 'a copy-link button appears');
  expect(!/[A-Z]/.test(code), 'lower case letters and digits only (easy to type)');
  tap($g('[data-close]')); await sleep(100);
});

/* =====================================================================
   THE STAGE
   ===================================================================== */
test('Tapping a door walks a hero there and the whole device travels', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  G("onTap({ seat: 'left', x: 1280, y: 800, hotspot: SCENES['academy-gate'].hotspots[0] })");
  await until(() => G("Stage.heroes.left.anim") === 'walk', 2000, 'Fire Girl to start walking');
  await until(() => G('document.body.dataset.place') === 'dorm', 8000, 'the dorm to open');
  expectEqual(G('P.left.scene'), 'dorm', 'presence followed');
  expectEqual(G('P.right.scene'), 'dorm', 'her sister came too');
  await until(() => G('P.away.scene') === 'dorm', 4000, 'the companion to catch up');
});

test('Every exit, hotspot, teacher, case, adventure and friend points at things that exist', async () => {
  await openGame(null);
  const problems = G(`(() => {
    const out = [];
    const itemIds = new Set(ITEMS.map(i => i.id)), questIds = new Set(QUESTS.map(q => q.id)), mythIds = new Set(MYTHS.map(m => m.id));
    const challengeIds = new Set([...Object.keys(CHALLENGES), ...Object.keys(PUZZLES)]);
    const spellIds = new Set([...Object.values(WORLD.heroes).flatMap(h => h.spells), ...WORLD.balance.togetherSpells].map(s => s.id));
    const seen = new Set();
    for (const i of ITEMS) { if (seen.has(i.id)) out.push('duplicate item ' + i.id); seen.add(i.id); if (!RARITY[i.rarity]) out.push(i.id + ' has unknown rarity ' + i.rarity); }
    for (const a of AREAS) { for (const q of a.quests) if (!questIds.has(q)) out.push('area ' + a.id + ' lists missing quest ' + q); for (const f of a.finds) if (!itemIds.has(f)) out.push('area ' + a.id + ' lists missing item ' + f); }
    for (const q of QUESTS) {
      if (!WORLD.people[q.giver]) out.push('quest ' + q.id + ' has unknown giver ' + q.giver);
      if (q.reward.item && !itemIds.has(q.reward.item)) out.push('quest ' + q.id + ' rewards missing item ' + q.reward.item);
      for (const s of q.steps) { if (s.challenge && !challengeIds.has(s.challenge)) out.push('quest ' + q.id + ' uses unknown challenge ' + s.challenge); if (s.spell && !spellIds.has(s.spell)) out.push('quest ' + q.id + ' casts unknown spell ' + s.spell); }
    }
    for (const [id, sc] of Object.entries(SCENES)) {
      for (const h of sc.hotspots) {
        if (h.kind === 'exit' && !SCENES[h.to]) out.push('scene ' + id + ' exit to missing scene ' + h.to);
        if (h.kind === 'npc' && h.npc !== 'teacher' && !WORLD.teachers[h.npc] && !WORLD.people[h.npc]) out.push('scene ' + id + ' npc unknown ' + h.npc);
      }
      for (const seat of WORLD.seats) if (sc.spawn[seat] == null) out.push('scene ' + id + ' has no spawn for ' + seat);
    }
    for (const [subj, s] of Object.entries(SCHOOL.subjects)) { if (!WORLD.teachers[s.teacher]) out.push('subject ' + subj + ' unknown teacher'); for (const c of s.challenges) if (!challengeIds.has(c)) out.push('subject ' + subj + ' unknown challenge ' + c); }
    for (const row of SCHOOL.rotation) for (const subj of row) if (!SCHOOL.subjects[subj]) out.push('rotation has unknown subject ' + subj);
    for (const row of SCHOOL.lunch.seatingByDay) for (const f of row) if (!FRIENDS[f]) out.push('lunch seating unknown friend ' + f);
    for (const ic of SCHOOL.lunch.iceCream) if (ic.unlock && !FRIENDS[ic.unlock.friend]) out.push('ice cream ' + ic.id + ' unknown friend');
    for (const f of Object.values(FRIENDS)) { for (const l of f.levels) if (l.gift && !itemIds.has(l.gift)) out.push('friend ' + f.id + ' gifts missing item ' + l.gift); for (const t of f.talks) if (t.replies.filter(r => r.kind).length !== 1) out.push('friend ' + f.id + ' talk needs exactly one kind reply'); }
    for (const m of MYTHS) { if (m.adventure && !ADVENTURES.some(a => a.id === m.adventure)) out.push('myth ' + m.id + ' unknown adventure'); for (const q of m.questions) if (!PUZZLES[q.type]) out.push('myth ' + m.id + ' unknown puzzle ' + q.type); if (m.pages.length < 3) out.push('myth ' + m.id + ' too short'); }
    for (const c of CASES) {
      if (!WORLD.people[c.giver]) out.push('case ' + c.id + ' unknown giver');
      if (c.unlock.case && !CASES.some(x => x.id === c.unlock.case)) out.push('case ' + c.id + ' unlock unknown case');
      for (const cl of c.clues) { if (!SCENES[cl.where]) out.push('case ' + c.id + ' clue in unknown scene ' + cl.where); if (!challengeIds.has(cl.puzzle)) out.push('case ' + c.id + ' unknown puzzle ' + cl.puzzle); }
      if (c.suspects.filter(s => s.it).length !== 1) out.push('case ' + c.id + ' needs exactly one culprit');
      if (!BADGES[c.reward.badge]) out.push('case ' + c.id + ' unknown badge ' + c.reward.badge);
      if (c.reward.friend && !WORLD.people[c.reward.friend] && !FRIENDS[c.reward.friend]) out.push('case ' + c.id + ' unknown friend ' + c.reward.friend);
    }
    for (const a of ADVENTURES) {
      if (!SCENES[a.start]) out.push('adventure ' + a.id + ' unknown start');
      if (a.unlock.scroll && !mythIds.has(a.unlock.scroll)) out.push('adventure ' + a.id + ' unknown scroll');
      for (const b of a.beats) {
        if (!SCENES[b.scene]) out.push('adventure ' + a.id + ' beat in unknown scene ' + b.scene);
        if (b.kind === 'duel' && !WORLD.troubles[b.trouble]) out.push('adventure ' + a.id + ' unknown trouble ' + b.trouble);
        if (b.kind === 'together' && !spellIds.has(b.spell)) out.push('adventure ' + a.id + ' unknown together spell ' + b.spell);
        if (b.kind === 'chest') for (const i of b.inside) if (!itemIds.has(i.item)) out.push('adventure ' + a.id + ' chest has missing item ' + i.item);
        if (b.kind === 'sparkle' && !itemIds.has(b.item)) out.push('adventure ' + a.id + ' sparkle missing item ' + b.item);
        if (b.kind === 'choice') for (const pth of b.paths) if (!a.beats[pth.next]) out.push('adventure ' + a.id + ' choice points past the end');
      }
    }
    for (const u of LAIR.upgrades) if (u.needs && !LAIR.upgrades.some(x => x.id === u.needs)) out.push('lair upgrade ' + u.id + ' needs unknown ' + u.needs);
    for (const s of Object.values(ITEM_SETS)) for (const i of s.items) if (!itemIds.has(i)) out.push('set lists missing item ' + i);
    const odds = Object.values(WORD_BOXES.pickOdds).reduce((a, b) => a + b, 0);
    if (Math.abs(odds - 1) > 0.001) out.push('WORD_BOXES.pickOdds add up to ' + odds + ', not 1');
    return out;
  })()`);
  expectEqual(problems, [], 'content problems');
});

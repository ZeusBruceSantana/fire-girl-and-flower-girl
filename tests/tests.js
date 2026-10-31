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
        if (h.kind === 'exit' && !(h.to.startsWith('map:') ? MAPS[h.to.slice(4)] : SCENES[h.to])) out.push('scene ' + id + ' exit to missing place ' + h.to);
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
      for (const cl of c.clues) { if (!SCENES[cl.where] && !MAPS[cl.where]) out.push('case ' + c.id + ' clue in unknown place ' + cl.where); if (!challengeIds.has(cl.puzzle)) out.push('case ' + c.id + ' unknown puzzle ' + cl.puzzle); }
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
    for (const [id, m] of Object.entries(MAPS)) {
      for (const d of m.doors) { const ok = d.to.startsWith('map:') ? MAPS[d.to.slice(4)] : SCENES[d.to.replace('scene:', '')]; if (!ok) out.push('map ' + id + ' door to missing place ' + d.to); }
      for (const t of m.troubles) if (!WORLD.troubles[t.kind]) out.push('map ' + id + ' unknown trouble ' + t.kind);
      for (const th of m.things) { if (th.item && !itemIds.has(th.item)) out.push('map ' + id + ' thing with missing item ' + th.item); if (th.inside) for (const i of th.inside) if (!itemIds.has(i.item)) out.push('map ' + id + ' chest with missing item ' + i.item); }
      for (const n of m.npcs) if (!WORLD.people[n.who] && !WORLD.teachers[n.who]) out.push('map ' + id + ' unknown npc ' + n.who);
      if (!SCENES[m.backdrop]) out.push('map ' + id + ' unknown backdrop');
      for (const [k, v] of Object.entries(m.spawn)) if (!Array.isArray(v)) out.push('map ' + id + ' bad spawn ' + k);
    }
    for (const w of (typeof WANTED !== 'undefined' ? WANTED : [])) { if (!WORLD.troubles[w.kind]) out.push('wanted ' + w.id + ' unknown trouble ' + w.kind); if (!MAPS[w.map]) out.push('wanted ' + w.id + ' unknown map ' + w.map); if (!itemIds.has(w.drop)) out.push('wanted ' + w.id + ' drops missing item ' + w.drop); }
    for (const [id, m] of Object.entries(MAPS)) for (const t of m.troubles) { if (typeof t.level !== 'number' && !['party', 'party+1'].includes(t.level)) out.push('map ' + id + ' trouble ' + t.id + ' bad level'); for (const p of t.pack || []) if (!WORLD.troubles[p.kind]) out.push('map ' + id + ' pack unknown trouble ' + p.kind); }
    for (const t of Object.values(WORLD.troubles)) { for (const l of t.loot) if (!itemIds.has(l.item)) out.push('trouble ' + t.name + ' loot missing item ' + l.item); if (!['fire', 'flower', 'electric'].includes(t.weakTo)) out.push('trouble ' + t.name + ' bad weakTo'); }
    for (const u of LAIR.upgrades) { if (u.needs && !LAIR.upgrades.some(x => x.id === u.needs)) out.push('lair upgrade ' + u.id + ' needs unknown ' + u.needs); if ((u.hearts != null) === (u.coins != null)) out.push('lair upgrade ' + u.id + ' must have exactly one of hearts or coins'); }
    for (const s of Object.values(ITEM_SETS)) for (const i of s.items) if (!itemIds.has(i)) out.push('set lists missing item ' + i);
    const odds = Object.values(WORD_BOXES.pickOdds).reduce((a, b) => a + b, 0);
    if (Math.abs(odds - 1) > 0.001) out.push('WORD_BOXES.pickOdds add up to ' + odds + ', not 1');
    return out;
  })()`);
  expectEqual(problems, [], 'content problems');
});

/* =====================================================================
   THE RPG INTERFACE: HUD, dialogue, challenges, spellbook (Epic 2a)
   ===================================================================== */
async function openWorld() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}

test('The HUD shows each hero: portrait, level ring, coins, hearts and the Ember meter', async () => {
  await openWorld();
  expectEqual($$g('#hud .hudcard').length, 2, 'two cards, one per seat');
  expect($g('.hudcard.seat-left .level').textContent.trim() === '1', 'level 1');
  G("dispatch('hero.coins', 'left', { amount: 12 }); dispatch('hero.xp', 'left', { amount: 20 })");
  await sleep(50);
  expectEqual($g('.hudcard.seat-left .coins b').textContent, '12', 'coins update at once');
  expect(parseFloat($g('.hudcard.seat-left .ring .fill').style.strokeDasharray) > 0, 'the XP ring filled a little');
  expectEqual($g('.hudcard.seat-left .ember b').textContent, '5', 'the Ember meter starts half full');
});

test('A dialogue types out, every word is tappable, and a choice resolves', async () => {
  await openWorld();
  G("window.__pick = null; Dialogue.choose({ who: 'Mrs. Crumb', art: 'baker', text: 'My oven is out again! Can you help?', choices: [{ word: 'Of course', value: 'yes' }, { word: 'Later', value: 'no' }] }).then(v => { window.__pick = v; })");
  await until(() => $g('.dlg .choices.show'), 3000, 'the choices to appear after typing');
  expect($$g('.dlg .text .w').length >= 6, 'the text is split into tappable words');
  expectEqual($g('.dlg .plate').textContent, 'Mrs. Crumb', 'the name plate');
  tap($$g('.dlg .choice')[1]);
  await until(() => G('window.__pick') === 'no', 2000, 'the choice to resolve');
  expect(!$g('.dlg'), 'the box closed');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('Hear it, tap it: a wrong tap gives a hint and the right word always wins in the end', async () => {
  await openWorld();
  G("window.__res = null; Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship' }).then(r => { window.__res = r; })");
  await until(() => $$g('.ch-opt').length === 3, 2000, 'three choices');
  expect($$g('.ch-opt').some(o => o.dataset.w === 'ship'), 'the target word is one of them');
  const wrong = $$g('.ch-opt').filter(o => o.dataset.w !== 'ship');
  tap(wrong[0]); await sleep(50);
  expect(wrong[0].classList.contains('out'), 'the wrong one fades out');
  expect($g('.ch-opt[data-w="ship"]').classList.contains('first-letter'), 'hint 1: the first letter is marked');
  tap(wrong[1]); await sleep(50);
  expect($g('.ch-opt[data-w="ship"]').classList.contains('glow') || $$g('.ch-opt.fade').length > 0, 'hint 2 or 3 shows');
  tap($g('.ch-opt[data-w="ship"]'));
  await until(() => G('window.__res'), 3000, 'the challenge to finish');
  const r = G('window.__res');
  expectEqual([r.word, r.tries, r.firstTry], ['ship', 2, false], 'two tries, not first try');
  expectEqual(G('S.heroes.left.wordStats.ship.box'), 0, 'a word with misses lands in box 0 (comes back soon)');
  expectEqual(G('S.heroes.left.ember'), 5 + 1, 'still earned ember (never zero)');
});

test('Build the word: tiles go into slots in order; a first-try win fills more ember', async () => {
  await openWorld();
  G("window.__res = null; Challenge.run({ seat: 'right', type: 'letter-tiles', word: 'cat' }).then(r => { window.__res = r; })");
  await until(() => $$g('.ch-tile').length >= 3, 2000, 'tiles');
  for (const l of ['c', 'a', 't']) { tap($$g('.ch-tile:not(.used)').find(t => t.dataset.l === l)); await sleep(40); }
  await until(() => G('window.__res'), 3000, 'the challenge to finish');
  expectEqual(G('window.__res.firstTry'), true, 'first try');
  expectEqual(G('S.heroes.right.ember'), 5 + 4, 'four ember for a first-try build');
  expectEqual(G('S.heroes.right.wordStats.cat.box'), 2, 'cat moved up a box');
});

test('Casting from the Spellbook powers the spell with a word and spends ember', async () => {
  await openWorld();
  G("Menu.open('left', 'spellbook')");
  await until(() => $g('#menu .spell'), 2000, 'the spellbook');
  expectEqual($$g('#menu .spell:not(.locked)').length, 1, 'only Spark is open at level 1');
  tap($g('#menu .spell[data-spell="spark"]'));
  await until(() => $$g('.ch-opt').length === 3, 3000, 'the word challenge');
  const target = G('Challenge.any.word');
  tap($g(`.ch-opt[data-w="${CSS.escape(target)}"]`));
  await until(() => !G('Challenge.any'), 3000, 'the cast to finish');
  await sleep(100);
  expectEqual(G('S.heroes.left.ember'), 5 + 3 - 1, 'earned 3 for a first try, paid 1 for Spark');
  expect(G("S.shared.events.some(e => e.what === 'cast' && e.spell === 'spark')"), 'the cast is in the shared events');
  expectEqual(G('Stage.heroes.left.anim'), 'cast', 'she strikes the casting pose');
});

test('The menu tabs all open: Bag, Journal, Map (with fog), Badges, Friends', async () => {
  await openWorld();
  G("Menu.open('right')");
  for (const t of ['bag', 'journal', 'map', 'badges', 'friends']) {
    tap($g(`#menu .tab[data-tab="${t}"]`)); await sleep(60); expect($g(`#menu .page-${t}`), 'tab ' + t + ' renders');
    if (t === 'map') expect($$g('#menu .place.seen').length >= 1 && $$g('#menu .place.fog').length >= 1, 'the map shows visited places and fog');
  }
  tap($g('#menu [data-close]')); await sleep(50);
  expect(!$g('#menu .frame'), 'closed');
});

/* =====================================================================
   THE SCHOOL DAY (Epic 2b)
   ===================================================================== */
async function answerAll(seat) {   // answer whatever challenge is up for this seat, first try, until none is up
  for (let i = 0; i < 12; i++) {
    const a = G(`Challenge.active['${seat}'] ? { type: Challenge.active['${seat}'].type, word: Challenge.active['${seat}'].word } : null`);
    if (!a) return;
    if (a.type === 'letter-tiles') { for (const l of a.word) { tap($$g(`.ch-card.seat-${seat} .ch-tile:not(.used)`).find(t => t.dataset.l === l)); await sleep(20); } }
    else tap($g(`.ch-card.seat-${seat} .ch-opt[data-w="${CSS.escape(a.word)}"]`));
    await sleep(80);
  }
}
async function tapNext() {   // a tap finishes the typing; another tap closes the box (unless it is waiting for a choice)
  for (let i = 0; i < 4 && $g('.dlg') && !$g('.dlg .choices.show'); i++) { tap($g('.dlg .next') || $g('.dlg .body')); await sleep(60); }
}

test('A whole school day: wake, two classes side by side, lunch with a friend and ice cream, bedtime', async () => {
  await openWorld();
  expectEqual(G('Day.part'), 'wake', 'the day starts in the morning');
  expect($g('.hudcard.seat-left .objective').textContent.includes('gate'), 'at the gate the objective says to go in (there is no bed here)');
  G("document.body.dataset.place = 'dorm'; HUD.render()");
  expect($g('.hudcard.seat-left .objective').textContent.includes('bed'), 'in the dorm it says to get up');
  // wake
  G("Day.onThing('left', { action: 'sleep' })"); await sleep(50); await tapNext();
  await until(() => G('Day.part') === 'period1', 3000, 'first class');
  // first class: both girls answer, side by side
  G("Day.onThing('left', { action: 'lesson' })"); await sleep(50); await tapNext();
  await until(() => $$g('.ch-card').length === 2, 4000, 'two challenge cards, one per girl');
  expect($g('#challenge.split'), 'the cards sit side by side');
  expect($$g('#range .range-row').length === 2, 'each girl has a row of targets');
  for (let i = 0; i < 8 && G('Day.part') === 'period1'; i++) { await answerAll('left'); await answerAll('right'); await sleep(60); if ($g('.dlg')) await tapNext(); }
  await until(() => G('Day.part') === 'period2', 6000, 'second class');
  const S1 = G('S');
  expect(S1.heroes.left.stars['day-1-period1-spells'] >= 1 && S1.heroes.right.stars['day-1-period1-spells'] >= 1, 'both got stars');
  expect(S1.heroes.left.xp > 0, 'xp for class');
  expect(Object.values(S1.heroes.left.wordStats).reduce((n, w) => n + w.seen, 0) >= 3, 'she practiced her words (a word may come round twice)');
  // second class: Numbers (Mr. Abacus). The math cards are answered by their own tests; here we skip the period.
  G("dispatch('clock.part', 'left', { day: 1, part: 'lunch' })"); await sleep(50);
  await until(() => G('Day.part') === 'lunch', 6000, 'lunch');
  // lunch: sit with the first friend of day 1, answer kindly
  G("Stage.scene = Object.assign({}, SCENES.cafeteria, { id: 'cafeteria' }); Day.sitAtTable('left', SCENES.cafeteria.hotspots.find(h => h.id === 'table-1'))");
  await sleep(80); await tapNext();
  await until(() => $g('.dlg .choices.show'), 4000, 'the friend asks something');
  const unkind = $$g('.dlg .choice').find(c => !c.querySelector('.icon'));
  tap($$g('.dlg .choice')[1]); await sleep(80);
  for (let i = 0; i < 6; i++) { if ($g('.dlg .choices.show')) { tap($$g('.dlg .choice')[0]); await sleep(80); } else if ($g('.dlg')) await tapNext(); else break; }
  void unkind;
  await until(() => (G("S.heroes.left.friends.ice") || 0) >= 1, 4000, 'hearts with the Ice princess');
  expect(G('S.heroes.left.hearts') >= 1, 'she has hearts');
  // ice cream for the right seat with coins
  G("dispatch('hero.coins', 'right', { amount: 5 })");
  const before = G('S.heroes.right.coins');
  G("Day.iceCream('right')"); await sleep(80);
  await until(() => $g('.dlg .choices.show'), 3000, 'flavors');
  tap($$g('.dlg .choice')[0]); await sleep(80); if ($g('.dlg')) await tapNext();
  await until(() => G('S.heroes.right.coins') === before - 2, 3000, 'vanilla cost 2 coins');
  await until(() => G('Day.part') === 'free', 4000, 'free time after lunch');
  // bedtime
  G("Day.onThing('left', { action: 'sleep' })"); await sleep(80);
  for (let i = 0; i < 6 && G('Day.day') === 1; i++) { await tapNext(); await sleep(60); }
  await until(() => G('Day.day') === 2, 4000, 'a new day');
  expectEqual(G('Day.part'), 'wake', 'day 2 starts in the morning');
  expect(G('S.heroes.left.ember') >= 5, 'ember refilled at bedtime');
});

test('Lunch is not served early, and the rotation gives Spells then Numbers on day 1', async () => {
  await openWorld();
  expectEqual(G('Day.subjects()'), ['spells', 'numbers'], 'day 1 is Spells and Numbers');
  G("Day.onThing('left', { action: 'sit' })"); await sleep(80);
  expect($g('.dlg .text').textContent.includes('Lunch'), 'Cook says lunch is not ready');
});

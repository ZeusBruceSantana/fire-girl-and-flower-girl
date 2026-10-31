'use strict';
/* Ember Bloom: the school day. One play session is one day (data/school.js):
     wake (dorm) -> first class -> second class -> lunch (cafeteria) -> free time (library and beyond) -> bedtime (dorm)
   The clock lives in S.shared.clock { day, part }. Each part tells the girls where to go (the HUD objective)
   and what happens when they get there. Both girls on a device take class side by side, each with her own
   challenges and her own words. */

const Day = {
  running: false,   // a class, lunch or bedtime is in progress
  get part() { return S.shared.clock.part; },
  get day() { return S.shared.clock.day; },
  /* Today's two subjects, from the rotation. Subjects whose class is not built yet are swapped for Spells. */
  subjects() {
    const row = SCHOOL.rotation[(this.day - 1) % SCHOOL.rotation.length];
    return row.map(s => (CLASS_RUNNERS[s] ? s : 'spells'));
  },
  subjectFor(part) { const i = { period1: 0, period2: 1 }[part]; return i == null ? null : this.subjects()[i]; },
  next(part) { const parts = SCHOOL.day.map(d => d.id), i = parts.indexOf(part); return parts[Math.min(parts.length - 1, i + 1)]; },
  advance() { const to = this.next(this.part); dispatch('clock.part', S.settings.localSeats[0], { day: this.day, part: to }); HUD.render(); applyClockTint(); },
  players() { return S.settings.localSeats.filter(isPlayerHere); },

  /* The word the HUD shows for "what now". */
  objective(seat) {
    const p = this.part, h = S.heroes[seat];
    if (!h.joined) return WORLD.ui.objAway;
    if (p === 'wake') return WORLD.ui.objWake;
    if (p === 'period1' || p === 'period2') return WORLD.ui.objClass.replace('{subject}', SCHOOL.subjects[this.subjectFor(p)].word);
    if (p === 'lunch') return WORLD.ui.objLunch;
    if (p === 'free') return S.shared.flags['gap-found'] ? WORLD.ui.objFree : WORLD.ui.objFreeMap;
    if (p === 'bedtime') return WORLD.ui.objBed;
    return '';
  },

  /* ---------- arriving somewhere / tapping something during the day ---------- */
  async onThing(seat, hotspot) {
    const p = this.part, action = hotspot.action;
    if (action === 'lesson' && (p === 'period1' || p === 'period2')) return this.runClass(this.subjectFor(p));
    if (action === 'lesson') return Dialogue.say({ who: WORLD.teachers.cinder.name, art: 'cinder', text: WORLD.ui.noClassNow });
    if (action === 'sit' && p === 'lunch') return this.sitAtTable(seat, hotspot);
    if (action === 'sit') return Dialogue.say({ seat, who: WORLD.teachers.cook.name, art: 'cook', text: WORLD.ui.notLunchYet });
    if (action === 'inventory' && typeof Bag !== 'undefined' && Bag.openCrafting) return Bag.openCrafting(seat);
    if (['upgrades', 'gallery', 'invite', 'scrolls'].includes(action) && typeof Lair !== 'undefined' && Lair.open) return Lair.open(seat, action);
    if (action === 'cases' && typeof Cases !== 'undefined' && Cases.openBoard) return Cases.openBoard(seat);
    if (action === 'map') return Menu.open(seat, 'map');
    if (action === 'sleep' && (p === 'bedtime' || p === 'free')) return this.bedtime();
    if (action === 'sleep' && p === 'wake') return this.wake();
    if (action === 'sleep') return Dialogue.say({ seat, who: S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title, text: WORLD.ui.notSleepy });
    return null;
  },
  async onNpc(seat, hotspot) {
    const p = this.part;
    if (hotspot.npc === 'teacher' && (p === 'period1' || p === 'period2')) return this.runClass(this.subjectFor(p));
    if (hotspot.npc === 'cook') return this.iceCream(seat);
    return null;
  },

  /* ---------- wake up ---------- */
  async wake() {
    if (this.running) return; this.running = true;
    const subs = this.subjects().map(s => SCHOOL.subjects[s].word);
    await Dialogue.say({ who: WORLD.school.short, text: WORLD.ui.goodMorning.replace('{day}', this.day).replace('{a}', subs[0]).replace('{b}', subs[1]) });
    this.advance();
    this.running = false;
  },

  /* ---------- a class period: both players at once, each with her own challenges ---------- */
  async runClass(subject) {
    if (this.running) return; this.running = true;
    const def = SCHOOL.subjects[subject], teacher = WORLD.teachers[def.teacher];
    const players = this.players();
    const n = def.perClass[S.settings.classLength] || def.perClass.normal;
    const key = 'day-' + this.day + '-' + this.part + '-' + subject;   // each period earns its own stars
    if (players.every(s => S.heroes[s].stars[key])) { await Dialogue.say({ who: teacher.name, art: teacher.art, text: WORLD.ui.classDone }); this.running = false; this.advance(); return; }
    await Dialogue.say({ who: teacher.name, art: teacher.art, text: def.about + ' ' + WORLD.ui.classStart.replace('{n}', n) });
    ClassRange.open(players, n, subject);
    const results = await Promise.all(players.map(seat => CLASS_RUNNERS[subject](seat, n, def)));
    ClassRange.close();
    for (let i = 0; i < players.length; i++) {
      const seat = players[i], r = results[i];
      const ratio = r.length ? r.filter(x => x.firstTry).length / r.length : 1;
      const stars = ratio >= SCHOOL.stars.three ? 3 : ratio >= SCHOOL.stars.two ? 2 : 1;
      dispatch('hero.stars', seat, { key, stars });
      dispatch('hero.xp', seat, { amount: 5 * r.length + 5 * stars });
      dispatch('hero.coins', seat, { amount: stars });
      if (stars === 3) dispatch('hero.badge', seat, { badge: 'three-stars' });
      const material = WORLD.heroes[S.heroes[seat].kind].material;
      if (material && ITEMS.some(i => i.id === material)) { dispatch('hero.item', seat, { item: material }); uiToast(WORLD.ui.found + ' ' + ITEMS.find(i => i.id === material).word, { icon: 'gem' }); }
      if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('hop');
    }
    const best = Math.max(...players.map(s => S.heroes[s].stars[key] || 1));
    await Dialogue.say({ who: teacher.name, art: teacher.art, text: WORLD.ui.classEnd[best] });
    this.running = false;
    this.advance();
  },

  /* ---------- lunch ---------- */
  friendsToday() { return SCHOOL.lunch.seatingByDay[(this.day - 1) % SCHOOL.lunch.seatingByDay.length]; },
  async sitAtTable(seat, hotspot) {
    const tables = Stage.scene.hotspots.filter(h => h.action === 'sit');
    const idx = tables.indexOf(hotspot), friends = this.friendsToday();
    const friendId = friends[idx];
    if (!friendId) { await Dialogue.say({ seat, who: S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title, text: WORLD.ui.emptyTable }); return; }
    const f = FRIENDS[friendId], h = S.heroes[seat];
    const talkedKey = 'lunch-' + this.day + '-' + friendId;
    if (h.stars[talkedKey]) { await Dialogue.say({ who: f.word, art: f.art, text: WORLD.ui.talkedAlready }); return; }
    const met = (h.friends[friendId] || 0) > 0;
    const lvl = f.levels.filter(l => (h.friends[friendId] || 0) >= l.hearts).length;
    await Dialogue.say({ who: met ? f.word : WORLD.ui.aPrincess, art: f.art, text: met ? f.levels[Math.max(0, lvl - 1)].say : f.levels[0].say + ' ' + WORLD.ui.iAm.replace('{name}', f.word) });
    const talk = f.talks[(this.day + idx) % f.talks.length];
    let kind = false, tries = 0;
    while (!kind) {
      const choices = talk.replies.map((r, i) => ({ word: r.word, value: i, icon: r.kind && tries > 0 ? 'heart' : null }));
      const pick = await Dialogue.choose({ who: f.word, art: f.art, text: talk.say, choices });
      kind = pick != null && talk.replies[pick].kind;
      if (!kind) { tries++; await Dialogue.say({ who: f.word, art: f.art, text: WORLD.ui.hmmAgain }); }
    }
    let hearts = (tries === 0 ? 2 : 1) + (typeof gearEffects === 'function' ? (gearEffects(seat).hearts || 0) : 0);
    if (typeof ArtClass !== 'undefined' && ArtClass.offerGift) hearts += await ArtClass.offerGift(seat, friendId);   // a painting as a gift, if she has one
    dispatch('hero.hearts', seat, { amount: hearts, friend: friendId });
    dispatch('hero.stars', seat, { key: talkedKey, stars: 1 });
    const newLvl = f.levels.filter(l => (S.heroes[seat].friends[friendId] || 0) >= l.hearts).length;
    uiToast('+' + hearts, { icon: 'heart' });
    if (newLvl > lvl) {
      const reached = f.levels[newLvl - 1];
      await Dialogue.say({ who: f.word, art: f.art, text: WORLD.ui.friendLevel.replace('{name}', f.word).replace('{n}', newLvl) + ' ' + reached.say });
      if (reached.gift) { dispatch('hero.item', seat, { item: reached.gift }); uiToast(ITEMS.find(i => i.id === reached.gift).word, { icon: 'gem' }); }
    } else await Dialogue.say({ who: f.word, art: f.art, text: WORLD.ui.thanksFriend });
    this.checkLunchDone();
  },
  async iceCream(seat) {
    const h = S.heroes[seat];
    const flavors = SCHOOL.lunch.iceCream.filter(ic => !ic.unlock || (h.friends[ic.unlock.friend] || 0) >= FRIENDS[ic.unlock.friend].levels[ic.unlock.level - 1].hearts);
    const pick = await Dialogue.choose({ who: WORLD.teachers.cook.name, art: 'cook', text: WORLD.ui.whichFlavor, choices: [...flavors.map(ic => ({ word: ic.word + ' · ' + ic.price, icon: 'coin', value: ic.id })), { word: WORLD.ui.noThanks, icon: 'close', value: null }] });
    if (pick == null) return;
    const ic = flavors.find(x => x.id === pick);
    if (h.coins >= ic.price) { dispatch('hero.coins', seat, { amount: -ic.price }); await Dialogue.say({ who: WORLD.teachers.cook.name, art: 'cook', text: WORLD.ui.enjoy.replace('{flavor}', ic.word) }); }
    else await Dialogue.say({ who: WORLD.teachers.cook.name, art: 'cook', text: WORLD.ui.onTheHouse });   // never a sad no
    dispatch('hero.ember', seat, { amount: 1 });
    dispatch('hero.hearts', seat, { amount: 1 });
    dispatch('event.add', seat, { what: 'ice-cream', flavor: ic.id, day: this.day });
    if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('hop');
    this.checkLunchDone();
  },
  checkLunchDone() {
    if (this.part !== 'lunch') return;
    const done = this.players().every(seat => this.friendsToday().some(f => S.heroes[seat].stars['lunch-' + this.day + '-' + f]) || S.shared.events.some(e => e.hero === seat && e.what === 'ice-cream' && e.day === this.day));
    if (done) { uiToast(WORLD.ui.lunchOver); this.advance(); }
  },

  /* ---------- bedtime: the day's summary, then a new day ---------- */
  async bedtime() {
    if (this.running) return; this.running = true;
    const day = this.day;
    for (const seat of this.players()) {
      const h = S.heroes[seat];
      const stars = Object.entries(h.stars).filter(([k]) => k.startsWith('day-' + day + '-')).reduce((a, [, v]) => a + v, 0);
      const words = Object.values(h.wordStats).filter(w => w.lastSeen > Date.now() - 6 * 3600 * 1000).length;
      await Dialogue.say({ seat, who: h.name || WORLD.heroes[h.kind].title, text: WORLD.ui.daySummary.replace('{day}', day).replace('{stars}', stars).replace('{words}', words).replace('{coins}', h.coins).replace('{hearts}', h.hearts) });
      dispatch('hero.ember', seat, { amount: 3 + (typeof gearEffects === 'function' ? (gearEffects(seat).freeSpark || 0) : 0) });
      if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('sleep');
    }
    if (day % 10 === 0) for (const seat of this.players()) dispatch('hero.badge', seat, { badge: 'ten-days' });
    dispatch('clock.day', S.settings.localSeats[0], { day: day + 1 });
    await sleepMs(TEST_MODE ? 10 : 1800);
    for (const seat of this.players()) if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('idle');
    await Dialogue.say({ who: WORLD.school.short, text: WORLD.ui.newDay.replace('{day}', day + 1) });
    HUD.render(); applyClockTint();
    this.running = false;
  },
};

/* What each class actually does with a seat. Returns the list of challenge results. */
const CLASS_RUNNERS = {
  async spells(seat, n, def) {
    const results = [];
    const types = def.challenges.filter(t => Challenge['render_' + t] && (t !== 'read-to-grown-up' || S.settings.readToGrownUp));
    for (let i = 0; i < n; i++) {
      const type = types[i % types.length];
      const spell = WORLD.heroes[S.heroes[seat].kind].spells[0];
      const r = await Challenge.run({ seat, type, reason: 'class', prompt: WORLD.ui.castWith.replace('{spell}', spell.word) });
      if (!r) break;
      results.push(r);
      ClassRange.light(seat, i, r.firstTry);
      if (Stage.heroes[seat]) { Stage.heroes[seat].setAnim('cast'); spellEffect(seat, spell); }
      await sleepMs(TEST_MODE ? 5 : 500);
    }
    return results;
  },
};

/* The target range: a row of candles (or seedlings, or bells) over each girl's side that light up as she casts. */
const ClassRange = {
  open(players, n, subject) {
    const el = $('#range'); el.innerHTML = ''; el.className = 'show ' + subject;
    for (const seat of players) {
      const row = document.createElement('div'); row.className = 'range-row seat-' + seat; row.dataset.seat = seat;
      const kind = S.heroes[seat].kind;
      row.innerHTML = Array.from({ length: n }, (_, i) => `<div class="target t-${kind}" data-i="${i}">${ART['target-' + kind] || ART.ember}</div>`).join('');
      el.appendChild(row);
    }
  },
  light(seat, i, bright) { const t = $(`#range .range-row[data-seat="${seat}"] .target[data-i="${i}"]`); if (t) t.classList.add('lit', bright ? 'bright' : 'soft'); },
  close() { setTimeout(() => { $('#range').className = ''; $('#range').innerHTML = ''; }, TEST_MODE ? 10 : 1200); },
};

/* The scene tint follows the clock: morning in first class, day at lunch, evening in free time, night at bedtime. */
function applyClockTint() {
  const part = S.shared.clock.part;
  Stage.clockTint = { wake: 'morning', period1: 'morning', period2: 'day', lunch: 'day', free: 'evening', bedtime: 'night' }[part] || null;
}

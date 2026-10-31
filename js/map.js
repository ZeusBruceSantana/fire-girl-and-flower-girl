'use strict';
/* Ember Bloom: the overworld (version 3). Big painted top-down maps (data/maps.js) the party walks across.
   Tap where to go: the game finds a path along the walkable areas (a grid with A*), the leader walks it and
   the others follow in a line. The camera scrolls. Troubles roam in the open; walking into one starts a
   battle. Doors lead into the storybook scenes (interiors) or other maps. */

const MAP_CELL = 64;              // pathfinding grid cell, in map pixels
const MAP_HERO_H = 300;           // heroes are smaller on a map than in a room
const MAP_VIEW_H = 1400;          // how many map pixels fit top to bottom on screen
const FOLLOW_GAP = 150;           // distance between party members in the line
const MAP_WALK_SPEED = 520;       // map pixels per second
const BUMP_DISTANCE = 160;        // how close a trouble has to be to start a battle
const BUMP_REST = 2.5;            // seconds after a battle in which no trouble can start another

const MapStage = {
  map: null, img: null, grid: null,
  cam: { x: 0, y: 0 }, scale: 1, visW: 0, visH: 0,
  leader: null, path: [], pending: null, trail: [],
  troubles: [], npcs: [], things: [], time: 0, bumpCooldown: 0,

  /* ---------- arriving ---------- */
  async go(mapId, { from = null } = {}) {
    const def = MAPS[mapId];
    if (!def) return;
    Stage.fadeTarget = 1;
    const base = 'art/maps/' + mapId + '/full';
    const [img] = await Promise.all([loadImage(base), sleepMs(Stage.ready ? 260 : 0)]);
    this.map = Object.assign({ id: mapId }, def);
    this.img = img;
    this.grid = buildGrid(def);
    Stage.map = this; Stage.scene = null; Stage.npcs = []; Stage.particles = [];
    Stage.mapParticles = def.particles;
    const at = (from && def.spawn[from]) || def.spawn.default;
    // the party: joined players first (the first one leads), then everyone else following
    const order = [...S.settings.localSeats.filter(isPlayerHere), ...WORLD.seats.filter(s => !isPlayerHere(s))].filter(s => S.heroes[s].kind || WORLD.defaultSides[s]);
    this.leader = order[0];
    this.trail = [];
    order.forEach((seat, i) => {
      const h = Stage.heroes[seat]; if (!h) return;
      h.height = MAP_HERO_H; h.visible = true; h.target = null; h.anim = 'idle'; h.mapTarget = null;
      h.x = at[0] - i * 40; h.y = at[1] + i * 10; h.facing = 1;
      if (isPlayerHere(seat)) setPresence(seat, { scene: 'map:' + mapId, x: h.x, y: h.y, anim: 'idle', driver: 'player' });
      else P[seat] = { scene: 'map:' + mapId, x: h.x, y: h.y, driver: P[seat].driver === 'player' ? 'player' : 'npc' };
    });
    this.party = order;
    this.path = []; this.pending = null;
    // Troubles: the map's own (minus the ones beaten today and the ones whose weather or hour is wrong), plus
    // today's wanted trouble if it was last seen here. Levels written as 'party' follow the players' level.
    const listed = def.troubles.filter(t => this.troubleOut(t));
    const wanted = typeof Cases !== 'undefined' && Cases.wantedToday ? Cases.wantedToday() : null;
    if (wanted && wanted.map === mapId) listed.push({ id: 'wanted-' + wanted.id, kind: wanted.kind, x: wanted.x, y: wanted.y, roam: wanted.roam, level: 'party', wanted: true, word: wanted.word, drop: wanted.drop, bounty: wanted.bounty });
    this.troubles = listed.filter(t => (S.shared.counters['beat-' + t.id] || 0) < S.shared.clock.day).map(t => {
      const d = WORLD.troubles[t.kind]; const sp = new NpcSprite(t.id, t.x); sp.y = t.y; sp.height = t.boss ? 360 : 240; sp.kind = d;
      sp.def = Object.assign({}, t, { level: this.partyLevel(t.level), pack: (t.pack || []).map(p => Object.assign({}, p, { level: this.partyLevel(p.level) })) });   // a copy: the data file is never changed
      sp.word = t.word || null;
      sp.wander = { next: 0, tx: t.x, ty: t.y }; sp.load({ body: 'art/troubles/' + (t.boss ? d.art + '-boss' : d.art) }); return sp; });
    this.npcs = def.npcs.map(n => { const who = WORLD.people[n.who] || WORLD.teachers[n.who]; const sp = new NpcSprite(n.id, n.x); sp.y = n.y; sp.height = 300; sp.def = n; sp.facing = -1; sp.setArt(who.art); return sp; });
    const reveal = typeof gearEffects === 'function' && this.party.some(s => isPlayerHere(s) && gearEffects(s).reveal);
    this.things = def.things.filter(th => !S.shared.flags['took-' + th.id] && (!th.hidden || reveal));
    if (typeof Cases !== 'undefined' && Cases.thingsFor) this.things.push(...Cases.thingsFor(mapId));
    this.scale = Stage.canvas.height / MAP_VIEW_H; this.visW = Stage.canvas.width / this.scale; this.visH = MAP_VIEW_H;
    this.cam.x = at[0]; this.cam.y = at[1]; this.clampCam();
    if (S.settings.localSeats.some(isPlayerHere) && !S.shared.flags['visited-map-' + mapId]) dispatch('flag.set', S.settings.localSeats.find(isPlayerHere), { flag: 'visited-map-' + mapId });
    Stage.fadeTarget = 0; Stage.ready = true;
    setScene('world');
    document.body.dataset.place = 'map:' + mapId;
    rememberPlace('map:' + mapId);
    uiSceneName(def.word);
    if (typeof Sound !== 'undefined' && Sound.music) Sound.music({ 'school-grounds': 'school', 'whispering-woods': 'woods', 'middlemarket': 'town', 'petalvale-orchard': 'woods', 'thunder-peak': 'peak' }[mapId] || 'woods');
    if (typeof Heart !== 'undefined' && Heart.maybeTest) await Heart.maybeTest(mapId, from);
    if (typeof Story !== 'undefined' && Story.check) Story.check('map:' + mapId);
  },
  leave() {
    for (const seat of WORLD.seats) { const h = Stage.heroes[seat]; if (h) { h.height = HERO_HEIGHT; h.mapTarget = null; } }
    Stage.map = null; this.map = null;
  },
  /* Is this trouble out right now? One with "only" keeps to its weather or its hour (data/maps.js). */
  troubleOut(t) {
    if (!t.only) return true;
    if (t.only.weather && (typeof Day === 'undefined' || Day.weather() !== t.only.weather)) return false;
    if (t.only.part && S.shared.clock.part !== t.only.part) return false;
    return true;
  },
  /* A trouble's level: a number as written, or 'party' = the average level of the players here (at least 1), 'party+1' one more. */
  partyLevel(level) {
    if (typeof level === 'number') return level;
    const players = (this.party || []).filter(isPlayerHere);
    const avg = players.length ? players.reduce((n, s) => n + S.heroes[s].level, 0) / players.length : 1;
    const base = Math.max(1, Math.round(avg));
    return level === 'party+1' ? base + 1 : base;
  },
  onResize() { if (!Stage.canvas) return; this.scale = Stage.canvas.height / MAP_VIEW_H; this.visW = Stage.canvas.width / this.scale; },
  clampCam() { if (!this.map) return; const [w, h] = this.map.size; this.cam.x = clamp(this.cam.x, this.visW / 2, Math.max(this.visW / 2, w - this.visW / 2)); this.cam.y = clamp(this.cam.y, this.visH / 2, Math.max(this.visH / 2, h - this.visH / 2)); },
  screenToWorld(px, py) { return [this.cam.x - this.visW / 2 + px * Stage.dpr / this.scale, this.cam.y - this.visH / 2 + py * Stage.dpr / this.scale]; },

  /* ---------- what is at a point ---------- */
  objectAt(x, y) {
    const inRect = r => x >= r[0] - 40 && x <= r[0] + r[2] + 40 && y >= r[1] - 40 && y <= r[1] + r[3] + 40;
    for (const t of this.troubles) if (Math.hypot(t.x - x, t.y - t.height * 0.5 - y) < t.height * 0.6) return { kind: 'trouble', obj: t, x: t.x, y: t.y };
    for (const n of this.npcs) if (Math.hypot(n.x - x, n.y - n.height * 0.5 - y) < n.height * 0.6) return { kind: 'npc', obj: n, x: n.x, y: n.y };
    for (const d of this.map.doors) if (inRect(d.rect)) return { kind: 'door', obj: d, x: d.rect[0] + d.rect[2] / 2, y: d.rect[1] + d.rect[3] / 2 };
    for (const th of this.things) if (inRect(th.rect)) return { kind: 'thing', obj: th, x: th.rect[0] + th.rect[2] / 2, y: th.rect[1] + th.rect[3] / 2 };
    return null;
  },

  /* A tap: the tapping girl becomes the leader and the party walks there. */
  tap(seat, x, y) {
    if (!isPlayerHere(seat)) return;
    const target = this.objectAt(x, y);
    const goal = target ? nearestWalkable(this.grid, target.x, target.y) : nearestWalkable(this.grid, x, y);
    if (!goal) return;
    const lead = Stage.heroes[seat];
    if (this.leader !== seat) { this.leader = seat; this.party = [seat, ...this.party.filter(s => s !== seat)]; this.trail = []; }
    this.path = findPath(this.grid, [lead.x, lead.y], goal);
    this.pending = target;
    if (target) Speech.say(target.obj.word || (target.obj.kind && target.obj.kind.name) || '', { interrupt: false });
    if (!this.path.length && target) this.arrive();
  },

  /* ---------- every frame ---------- */
  update(dt, now) {
    this.time += dt;
    this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);
    const lead = Stage.heroes[this.leader];
    if (lead && this.path.length && !sceneLayer) {
      const [tx, ty] = this.path[0];
      const dx = tx - lead.x, dy = ty - lead.y, dist = Math.hypot(dx, dy), step = MAP_WALK_SPEED * dt;
      if (dist <= step) { lead.x = tx; lead.y = ty; this.path.shift(); if (!this.path.length) { lead.anim = 'idle'; this.arrive(); if (!this.map) return; } }
      else { lead.x += dx / dist * step; lead.y += dy / dist * step; lead.anim = 'walk'; lead.animT += dt; lead.facing = dx < 0 ? -1 : (dx > 0 ? 1 : lead.facing); }
      if (!this.trail.length || Math.hypot(lead.x - this.trail[0][0], lead.y - this.trail[0][1]) >= 30) { this.trail.unshift([lead.x, lead.y, lead.facing]); if (this.trail.length > 60) this.trail.pop(); }
      if (isPlayerHere(this.leader)) setPresence(this.leader, { x: Math.round(lead.x), y: Math.round(lead.y), anim: lead.anim, facing: lead.facing });
    } else if (lead && lead.anim === 'walk') lead.anim = 'idle';
    // followers trail the leader along her path, each a little further back
    this.party.forEach((seat, i) => {
      if (i === 0) return;
      const h = Stage.heroes[seat]; if (!h) return;
      const idx = Math.min(this.trail.length - 1, i * Math.round(FOLLOW_GAP / 30) - 1);
      const goal = idx >= 0 ? this.trail[idx] : null;
      if (!goal) { h.anim = 'idle'; return; }
      const dx = goal[0] - h.x, dy = goal[1] - h.y, dist = Math.hypot(dx, dy), step = MAP_WALK_SPEED * dt;
      if (dist > 8) { const m = Math.min(step, dist); h.x += dx / dist * m; h.y += dy / dist * m; h.anim = 'walk'; h.animT += dt; h.facing = dx < 0 ? -1 : 1; }
      else h.anim = 'idle';
    });
    // troubles wander in their patch
    for (const t of this.troubles) {
      const w = t.wander, r = t.def.roam;
      if (now > w.next) { w.tx = r[0] + Math.random() * r[2]; w.ty = r[1] + Math.random() * r[3]; w.next = now + 1500 + Math.random() * 2500; }
      const dx = w.tx - t.x, dy = w.ty - t.y, dist = Math.hypot(dx, dy), step = 90 * dt;
      if (dist > step) { t.x += dx / dist * step; t.y += dy / dist * step; t.facing = dx < 0 ? -1 : 1; t.anim = 'walk'; t.animT += dt; } else t.anim = 'idle';
      // A battle starts when the party WALKS into a trouble, never when one wanders into a party standing still.
      if (lead && !sceneLayer && this.map && this.path.length && this.bumpCooldown <= 0 && Math.hypot(lead.x - t.x, lead.y - t.y) < BUMP_DISTANCE) { this.bump(t); return; }
    }
    // camera follows the leader
    if (lead) { this.cam.x = lerp(this.cam.x, lead.x, Math.min(1, dt * 4)); this.cam.y = lerp(this.cam.y, lead.y - 120, Math.min(1, dt * 4)); this.clampCam(); }
  },

  /* The leader reached what she tapped. */
  async arrive() {
    const target = this.pending; this.pending = null;
    if (!target) return;
    const seat = this.leader;
    if (target.kind === 'door') {
      const d = target.obj;
      if (d.locked && !S.shared.flags[d.locked]) { await Dialogue.say({ seat, who: S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title, text: d.lockedSay || WORLD.ui.locked }); return; }
      if (d.secret && !S.shared.flags['gap-found']) { dispatch('flag.set', seat, { flag: 'gap-found' }); uiToast(WORLD.ui.secretWay, { icon: 'heart' }); }
      if (typeof Sound !== 'undefined' && Sound.play) Sound.play('door');
      await stageGo(d.to, { from: 'map:' + this.map.id, at: d.at });
    } else if (target.kind === 'thing') {
      const th = target.obj;
      if (th.kind === 'clue' && typeof Cases !== 'undefined') { await Cases.onClue(seat, th); this.things = this.things.filter(x => x !== th); }
      else if (th.kind === 'sign') await Dialogue.say({ who: th.word, text: th.text });
      else if (th.kind === 'sparkle') { this.take(th); dispatch('hero.item', seat, { item: th.item }); uiToast(WORLD.ui.found + ' ' + ITEMS.find(i => i.id === th.item).word, { icon: 'gem' }); Stage.heroes[seat].setAnim('hop'); }
      else if (th.kind === 'chest') {
        await Dialogue.say({ seat, who: WORLD.helper.name, art: WORLD.helper.art, text: WORLD.ui.openChest });
        const r = await Challenge.run({ seat, type: 'letter-tiles', prompt: WORLD.ui.openChest });
        if (!r) return;
        if (typeof Sound !== 'undefined' && Sound.play) Sound.play('chest');
        this.take(th);
        for (const i of th.inside) if (Math.random() < i.chance) { dispatch('hero.item', seat, { item: i.item }); uiToast(WORLD.ui.found + ' ' + ITEMS.find(x => x.id === i.item).word, { icon: 'gem' }); await sleepMs(TEST_MODE ? 5 : 700); }
        Stage.heroes[seat].setAnim('hop');
      }
    } else if (target.kind === 'npc') {
      const n = target.obj.def || target.obj, who = WORLD.people[n.who] || WORLD.teachers[n.who];
      if (n.shop && typeof Shop !== 'undefined' && Shop.open) return Shop.open(seat, n.shop);
      if (n.who === 'pebble' && typeof Cases !== 'undefined' && Cases.talkToPebble) return Cases.talkToPebble(seat);
      if (n.who === 'cook') return Day.iceCream(seat);
      await Dialogue.say({ who: who.name, art: who.art, text: n.talk || who.about });
    } else if (target.kind === 'trouble') {
      this.bump(target.obj);
    }
  },
  take(th) { dispatch('flag.set', this.leader, { flag: 'took-' + th.id }); this.things = this.things.filter(x => x !== th); },

  /* Walked into a trouble: battle! */
  async bump(t) {
    if (this.bumpCooldown > 0 || sceneLayer) return;
    this.bumpCooldown = 3;
    this.path = []; this.pending = null;
    const def = t.def, kind = t.kind;
    const party = this.party.filter(s => S.heroes[s].kind);
    const players = party.filter(isPlayerHere);
    // the trouble, then anything it brought along (a "pack"), one after the other in the same battle
    const queue = [{ kind: def.kind, level: def.level, boss: !!def.boss }, ...(def.pack || []).map(p => ({ kind: p.kind, level: p.level, boss: !!p.boss }))];
    let result = null;
    if (typeof Battle !== 'undefined' && Battle.start) result = await Battle.start({ troubles: queue, backdrop: this.map.backdrop, party });
    else { await Dialogue.say({ who: kind.name, art: null, text: (def.boss ? WORLD.ui.battleBossStart : WORLD.ui.battleStart).replace('{name}', kind.name) + ' (battle coming soon)' }); result = { won: true, xp: 0, coins: 0, loot: [] }; }
    if (result && result.won) {
      dispatch('counter.max', this.leader, { key: 'beat-' + def.id, value: S.shared.clock.day });
      this.troubles = this.troubles.filter(x => x !== t);
      if (def.wanted && typeof Cases !== 'undefined' && Cases.wantedWon) Cases.wantedWon(def, players);
    }
    this.backOff();
    this.bumpCooldown = BUMP_REST;
  },
  /* After a battle the other troubles back away from the party and mind their own business for a while,
     so a win is never followed by an ambush. */
  backOff() {
    const lead = Stage.heroes[this.leader]; if (!lead || !this.map) return;
    for (const t of this.troubles) {
      const d = Math.hypot(lead.x - t.x, lead.y - t.y);
      if (d > BUMP_DISTANCE * 4) continue;
      const r = t.def.roam, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
      // the corner of its patch farthest from the party
      const corners = [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0], r[1] + r[3]], [r[0] + r[2], r[1] + r[3]]];
      const far = corners.sort((a, b) => Math.hypot(lead.x - b[0], lead.y - b[1]) - Math.hypot(lead.x - a[0], lead.y - a[1]))[0];
      t.x = far[0]; t.y = far[1];
      if (Math.hypot(lead.x - t.x, lead.y - t.y) < BUMP_DISTANCE * 2) {   // a tiny patch: step straight away from the party instead
        const ang = Math.atan2(cy - lead.y, cx - lead.x) || 0.7;
        t.x = lead.x + Math.cos(ang) * BUMP_DISTANCE * 2.5; t.y = lead.y + Math.sin(ang) * BUMP_DISTANCE * 2.5;
      }
      t.wander = { next: performance.now() + BUMP_REST * 1000, tx: t.x, ty: t.y };
    }
  },

  /* ---------- drawing ---------- */
  draw(ctx) {
    const c = Stage.canvas, s = this.scale, left = this.cam.x - this.visW / 2, top = this.cam.y - this.visH / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#243a1e'; ctx.fillRect(0, 0, c.width, c.height);
    if (this.img) {
      // Only the slice of the painting that is on screen is drawn (the whole 4096 x 3072 picture would be
      // rescaled every frame otherwise). The slice is measured in the picture's own pixels, which may differ
      // from the map's logical size.
      const [mw, mh] = this.map.size, iw = this.img.naturalWidth || this.img.width, ih = this.img.naturalHeight || this.img.height;
      if (iw && ih) {
        const sx = clamp(left, 0, mw), sy = clamp(top, 0, mh);
        const sw = Math.min(this.visW - (sx - left), mw - sx), sh = Math.min(this.visH - (sy - top), mh - sy);
        if (sw > 0 && sh > 0) ctx.drawImage(this.img, sx * iw / mw, sy * ih / mh, sw * iw / mw, sh * ih / mh, (sx - left) * s, (sy - top) * s, sw * s, sh * s);
      } else ctx.drawImage(this.img, -left * s, -top * s, mw * s, mh * s);
    }
    ctx.setTransform(s, 0, 0, s, -left * s, -top * s);
    this.drawThings(ctx);
    const actors = [...this.party.map(seat => Stage.heroes[seat]).filter(h => h && h.visible), ...this.npcs, ...this.troubles];
    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw(ctx, Stage.time);
    this.drawMarkers(ctx);
    drawParticles(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (QUERY.has('debug')) { ctx.setTransform(s, 0, 0, s, -left * s, -top * s); ctx.strokeStyle = 'rgba(255,0,0,.6)'; ctx.lineWidth = 6; for (const r of this.map.walk) ctx.strokeRect(...r); ctx.setTransform(1, 0, 0, 1, 0, 0); }
  },
  drawThings(ctx) {
    const t = Stage.time;
    for (const th of this.things) {
      const [x, y, w, h] = th.rect, cx = x + w / 2, cy = y + h / 2;
      ctx.save();
      if (th.kind === 'chest') { ctx.fillStyle = '#8a5a2a'; roundRect(ctx, x, y, w, h, 14); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + w * 0.42, y + h * 0.3, w * 0.16, h * 0.4); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 6; roundRect(ctx, x, y, w, h, 14); ctx.stroke(); }
      else if (th.kind === 'clue') { ctx.globalAlpha = 0.7 + Math.sin(t * 4 + x) * 0.3; drawGlow(ctx, cx, cy, 70, '#7fc4ff', 0.7); ctx.fillStyle = '#7fc4ff'; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 48px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', cx, cy + 17); }
      else if (th.kind === 'sparkle') { ctx.globalAlpha = 0.6 + Math.sin(t * 5 + x) * 0.4; drawGlow(ctx, cx, cy, 70, '#ffd23f', 0.7); ctx.fillStyle = '#fff6a8'; star(ctx, cx, cy, 5, 38, 16, t); ctx.fill(); }
      else if (th.kind === 'sign') { ctx.fillStyle = '#8a5a2a'; ctx.fillRect(cx - 10, cy, 20, h); ctx.fillStyle = '#e9c58a'; roundRect(ctx, x, y, w, h * 0.6, 10); ctx.fill(); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 5; roundRect(ctx, x, y, w, h * 0.6, 10); ctx.stroke(); }
      ctx.restore();
    }
  },
  drawMarkers(ctx) {
    const t = Stage.time;
    for (const n of this.npcs) { const top = n.y - n.height - 20 + Math.sin(t * 3) * 10; ctx.save(); drawGlow(ctx, n.x, top - 32, 55, '#ffb347', 0.7); ctx.fillStyle = '#ffd23f'; roundRect(ctx, n.x - 12, top - 70, 24, 50, 10); ctx.fill(); ctx.beginPath(); ctx.arc(n.x, top - 4, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    for (const d of this.map.doors) {
      if (d.secret && !S.shared.flags['gap-found']) continue;
      const cx = d.rect[0] + d.rect[2] / 2, cy = d.rect[1] + d.rect[3] / 2 + Math.sin(t * 3) * 8;
      ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = d.locked && !S.shared.flags[d.locked] ? '#c9c3d3' : '#fff';
      drawGlow(ctx, cx, cy - 8, 40, 'rgba(0,0,0,.4)', 0.6);
      ctx.beginPath(); ctx.moveTo(cx - 22, cy - 26); ctx.lineTo(cx + 22, cy - 26); ctx.lineTo(cx, cy + 10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  },
};
function star(ctx, cx, cy, n, R, r, t) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = t + i * Math.PI / n, rad = i % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } ctx.closePath(); }

/* ---------- the walkable grid and A* ---------- */
function buildGrid(def) {
  const cols = Math.ceil(def.size[0] / MAP_CELL), rows = Math.ceil(def.size[1] / MAP_CELL);
  const cells = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * MAP_CELL + MAP_CELL / 2, y = r * MAP_CELL + MAP_CELL / 2;
    if (def.walk.some(w => x >= w[0] && x <= w[0] + w[2] && y >= w[1] && y <= w[1] + w[3])) cells[r * cols + c] = 1;
  }
  return { cols, rows, cells, ok: (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && cells[r * cols + c] === 1 };
}
const toCell = v => Math.floor(v / MAP_CELL), toWorld = i => i * MAP_CELL + MAP_CELL / 2;
/* The nearest walkable point to (x, y), searching outward a few cells. */
function nearestWalkable(grid, x, y) {
  const c0 = toCell(x), r0 = toCell(y);
  if (grid.ok(c0, r0)) return [x, y];
  for (let d = 1; d <= 40; d++) {
    let best = null, bd = Infinity;
    for (let r = r0 - d; r <= r0 + d; r++) for (let c = c0 - d; c <= c0 + d; c++) {
      if (Math.max(Math.abs(c - c0), Math.abs(r - r0)) !== d || !grid.ok(c, r)) continue;
      const dist = Math.hypot(toWorld(c) - x, toWorld(r) - y); if (dist < bd) { bd = dist; best = [toWorld(c), toWorld(r)]; }
    }
    if (best) return best;
  }
  return null;
}
/* A* over the grid. Returns world points to walk through (the start cell is not included). */
function findPath(grid, from, to) {
  const sc = toCell(from[0]), sr = toCell(from[1]), gc = toCell(to[0]), gr = toCell(to[1]);
  if (!grid.ok(gc, gr)) return [];
  if (!grid.ok(sc, sr)) { const n = nearestWalkable(grid, from[0], from[1]); if (!n) return []; return [n, ...findPath(grid, n, to)]; }
  const key = (c, r) => r * grid.cols + c;
  const open = [[0, sc, sr]], came = new Map(), g = new Map([[key(sc, sr), 0]]);
  const h = (c, r) => Math.hypot(c - gc, r - gr);
  const closed = new Set();
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [, c, r] = open.shift(); const k = key(c, r);
    if (closed.has(k)) continue; closed.add(k);
    if (c === gc && r === gr) break;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (!grid.ok(nc, nr)) continue;
      if (dc && dr && !(grid.ok(c + dc, r) && grid.ok(c, r + dr))) continue;   // no cutting corners
      const nk = key(nc, nr), ng = g.get(k) + (dc && dr ? 1.414 : 1);
      if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); came.set(nk, k); open.push([ng + h(nc, nr), nc, nr]); }
    }
  }
  if (!came.has(key(gc, gr)) && !(sc === gc && sr === gr)) return [];
  const cells = [];
  let k = key(gc, gr);
  while (k !== key(sc, sr)) { cells.push([k % grid.cols, Math.floor(k / grid.cols)]); k = came.get(k); if (k == null) break; }
  cells.reverse();
  const pts = cells.map(([c, r]) => [toWorld(c), toWorld(r)]);
  if (pts.length) pts[pts.length - 1] = [to[0], to[1]];
  return smoothPath(grid, from, pts);
}
/* Drop points you can walk straight past, so the party does not zigzag along cell centers. */
function smoothPath(grid, from, pts) {
  const out = []; let cur = from;
  let i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !clearLine(grid, cur, pts[j])) j--;
    out.push(pts[j]); cur = pts[j]; i = j + 1;
  }
  return out;
}
function clearLine(grid, a, b) {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (MAP_CELL / 2));
  for (let i = 0; i <= n; i++) { const t = i / n; if (!grid.ok(toCell(lerp(a[0], b[0], t)), toCell(lerp(a[1], b[1], t)))) return false; }
  return true;
}

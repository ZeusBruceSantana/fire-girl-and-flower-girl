'use strict';
/* Ember Bloom: heroes and other people on the stage, drawn as paper dolls.
   A paper doll is a stack of pictures (back, body, outfit, face, hair, head, hand), 400 x 600 each, feet on the
   bottom edge, facing right. Items a hero wears can swap in their own layer pictures. Animations are small
   and friendly: an idle bob, a walking wobble, a cast pose, a happy hop, sleeping.
   A PAINTED figure (one full picture, listed in art/overrides.js) is a living painting instead: it is drawn in thin
   horizontal bands that bend a little each frame, so hair sways, the dress and cape swish, she breathes and leans
   into her walk while her feet stay planted; magic flickers at her hand (WORLD.heroes[kind].motion). Optional pose
   paintings (walk-1, walk-2, cast, cheer, sleep) swap in while she walks, casts, hops or sleeps. */

const DOLL_LAYERS = ['back', 'body', 'outfit', 'face', 'hair', 'head', 'hand'];
const HERO_POSES = ['walk-1', 'walk-2', 'cast', 'cheer', 'sleep'];   // optional pose paintings (docs/ART-PROMPTS-CHARACTERS.md)
/* The tablet's reduced-motion setting (or html.reduce-motion): painted figures then stay still apart from walking. */
const REDUCED_MQ = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const reducedMotion = () => document.documentElement.classList.contains('reduce-motion') || !!(REDUCED_MQ && REDUCED_MQ.matches);

class Doll {
  constructor() { this.x = 0; this.y = 0; this.facing = 1; this.anim = 'idle'; this.animT = 0; this.visible = true; this.layers = {}; this.height = HERO_HEIGHT; this.target = null; this.justStopped = false; }
  async load(paths) {                                  // paths: layer -> file base (no extension)
    const entries = await Promise.all(Object.entries(paths).map(async ([l, base]) => [l, await loadImage(base)]));
    this.layers = Object.fromEntries(entries.filter(e => e[1]));
  }
  placeOnPath(x) { const path = Stage.scene ? Stage.scene.path : [[0, 1280], [2560, 1280]]; const [lo, hi] = pathBounds(path); this.x = clamp(x, lo, hi); this.y = pathY(path, this.x); }
  walkTo(x, hotspot) {
    const [lo, hi] = pathBounds(Stage.scene.path);
    this.target = clamp(x, lo, hi); this.pendingHotspot = hotspot || null;
    if (Math.abs(this.target - this.x) < 8) { this.target = null; this.justStopped = true; }
  }
  update(dt, path) {
    this.animT += dt;
    if (this.target != null) {
      const d = this.target - this.x;
      const ease = Math.min(1, Math.abs(d) / 160) * 0.7 + 0.3;          // slow down into the stop
      const step = WALK_SPEED * ease * dt;
      this.facing = d < 0 ? -1 : 1;
      if (Math.abs(d) <= step) { this.x = this.target; this.target = null; this.anim = 'idle'; this.justStopped = true; }
      else { this.x += Math.sign(d) * step; this.anim = 'walk'; }
      this.y = pathY(path, this.x);
    }
    if (this.anim === 'cast' && this.animT > 1.2) this.anim = 'idle';
    if (this.anim === 'hop' && this.animT > 0.6) this.anim = 'idle';
  }
  setAnim(a) { this.anim = a; this.animT = 0; }
  draw(ctx, time) {
    if (this.painted && this.layers.body) return this.drawPainted(ctx, time);
    const h = this.height, w = h * 400 / 600;
    let bob = 0, tilt = 0, sx = 1, sy = 1;
    if (this.anim === 'idle') { bob = Math.sin(time * 2.2 + this.x * 0.01) * 5; sy = 1 + Math.sin(time * 2.2 + this.x * 0.01) * 0.012; }
    if (this.anim === 'walk') { bob = Math.abs(Math.sin(this.animT * 11)) * 16; tilt = Math.sin(this.animT * 11) * 0.06; }
    if (this.anim === 'cast') { const t = Math.min(1, this.animT / 0.3); sx = sy = 1 + t * 0.08; bob = t * 10; }
    if (this.anim === 'hop') { bob = Math.sin(Math.min(1, this.animT / 0.6) * Math.PI) * 70; }
    if (this.anim === 'sleep') { tilt = 0.5 * this.facing; bob = -h * 0.25; }
    ctx.save();
    ctx.translate(this.x, this.y - bob);
    ctx.rotate(tilt);
    ctx.scale(this.facing * sx, sy);
    // soft shadow on the ground
    ctx.fillStyle = 'rgba(40,20,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, bob * 0.3 + 6, w * 0.34, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    for (const l of DOLL_LAYERS) { const img = this.layers[l]; if (img) ctx.drawImage(img, -w / 2, -h, w, h); }
    if (this.anim === 'cast') drawCastSparkle(ctx, this, time, w, h);
    ctx.restore();
    if (this.label && !Stage.map) drawLabel(ctx, this);   // name tags only in rooms and at the gate; an overworld has none
  }
  /* The picture for this moment: a pose painting when there is one, else the main painting. */
  poseImage() {
    const p = this.poses || {};
    if (this.anim === 'walk' && p['walk-1'] && p['walk-2']) return Math.floor(this.animT * 3.6) % 2 ? p['walk-2'] : p['walk-1'];
    if (this.anim === 'cast' && p.cast) return p.cast;
    if (this.anim === 'hop' && p.cheer) return p.cheer;
    if (this.anim === 'sleep' && p.sleep) return p.sleep;
    return this.layers.body;
  }
  drawPainted(ctx, time) {
    const img = this.poseImage(), m = this.motion || {}, calm = reducedMotion() ? 0 : 1;
    const h = this.height, w = h * img.width / img.height;
    const t = time + this.x * 0.0031, step = this.animT * 11.3;          // step: two footfalls per cycle, as the bob
    const walking = this.anim === 'walk', hair = (m.hair == null ? 1 : m.hair) * calm, skirt = (m.skirt == null ? 1 : m.skirt) * calm;
    let bob = 0, tilt = 0, sx = 1, sy = 1, lean = 0;
    if (this.anim === 'idle') { const b = Math.sin(t * 2.1); bob = b * 3 * calm; sy = 1 + b * 0.01 * calm; }            // breathing
    if (walking) { const c = Math.abs(Math.sin(step)); bob = c * 14; sy = 1 - (1 - c) * 0.035; sx = 1 + (1 - c) * 0.02; lean = 16; tilt = Math.sin(step) * 0.025; }
    if (this.anim === 'cast') { const k = Math.min(1, this.animT / 0.25), back = Math.max(0, 1 - this.animT / 0.5); sx = sy = 1 + k * 0.07; bob = k * 12; lean = -18 * back + 10 * (1 - back); }
    if (this.anim === 'hop') { const k = Math.min(1, this.animT / 0.6); bob = Math.sin(k * Math.PI) * 70; sy = 1 + Math.sin(k * Math.PI) * 0.06; sx = 1 - Math.sin(k * Math.PI) * 0.04; }
    if (this.anim === 'sleep') { tilt = 0.5 * this.facing; bob = -h * 0.25; }
    ctx.save();
    ctx.translate(this.x, this.y - bob);
    ctx.rotate(tilt);
    ctx.scale(this.facing * sx, sy);
    ctx.fillStyle = 'rgba(40,20,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, bob * 0.3 + 6, w * 0.32, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    // the bands: v runs 0 (top of her head) to 1 (her feet); feet never move
    const N = 40, sh = img.height / N, dh = h / N;
    const bend = v => {
      const planted = 1 - Math.min(1, Math.max(0, (v - 0.84) / 0.12));
      const hairW = Math.max(0, (0.45 - v) / 0.45), skirtW = Math.max(0, 1 - Math.abs(v - 0.68) / 0.24);
      let dx = hairW * hair * 5 * Math.sin(t * 1.7) + skirtW * skirt * 6 * Math.sin(t * 1.25 + v * 4);
      if (walking) dx += -hairW * hair * 12 * (0.7 + 0.3 * Math.sin(step * 2)) + skirtW * skirt * 11 * Math.sin(step + v * 3);
      dx += lean * (1 - v);                                            // leaning into the walk (or back, winding up a spell)
      return dx * planted;
    };
    for (let i = 0; i < N; i++) ctx.drawImage(img, 0, i * sh, img.width, sh + 0.5, -w / 2 + bend((i + 0.5) / N), -h + i * dh, w, dh + 0.6);
    if (m.magic) {
      const [ax, ay] = m.at || [0.9, 0.3], mx = -w / 2 + ax * w + bend(ay), my = -h + ay * h;
      drawMagic(ctx, m.magic, mx, my, h, time, this.anim === 'cast' ? 2 : 1, calm);
    }
    if (this.anim === 'cast') drawCastSparkle(ctx, this, time, w, h);
    ctx.restore();
    if (this.label && !Stage.map) drawLabel(ctx, this);
  }
}
/* A princess's own magic at her hand, drawn over her painting: a flame that flickers, petals that drift, sparks that
   crackle. Additive light, no canvas shadow blur (that is slow on a tablet). `big` doubles it while she casts. */
function drawMagic(ctx, kind, x, y, h, time, big, calm) {
  const u = h / 480;                                                   // sizes are for a 480-pixel princess
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const glow = (r, color, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  const flick = calm ? 0.75 + 0.25 * Math.sin(time * 13) * Math.sin(time * 7.3 + 1) : 0.85;
  if (kind === 'flame') {
    glow(38 * u * big * flick, 'rgba(255,170,60,0.9)', 0.55);
    for (let i = 0; i < 5 * big; i++) {                               // embers rising off the flame
      const k = ((time * 0.9 + i * 0.37) % 1), ex = x + Math.sin(i * 2.1 + time * 3) * 8 * u, ey = y - k * 60 * u;
      ctx.globalAlpha = (1 - k) * 0.9 * calm; ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff7a3d'; ctx.beginPath(); ctx.arc(ex, ey, (2.5 + (1 - k) * 2) * u, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'petals') {
    glow(30 * u * big, 'rgba(170,255,170,0.7)', 0.35 + 0.1 * flick);
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4 * big; i++) {                               // petals drifting up and away
      const k = ((time * 0.35 + i * 0.27) % 1), px = x + Math.sin(k * 6 + i) * 22 * u + k * 18 * u, py = y - k * 70 * u;
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.95 * calm; ctx.fillStyle = i % 2 ? '#ff8fb8' : '#ffc4dc';
      ctx.save(); ctx.translate(px, py); ctx.rotate(time * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 6 * u, 3.5 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  } else if (kind === 'sparks') {
    glow(34 * u * big * flick, 'rgba(150,210,255,0.9)', 0.5);
    const tick = Math.floor(time * 14);                               // a new crackle 14 times a second
    ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 2.2 * u; ctx.lineCap = 'round';
    for (let i = 0; i < 3 * big; i++) {
      const r = n => { const s = Math.sin((tick + 1) * 12.9898 + i * 78.233 + n * 37.719) * 43758.5453; return s - Math.floor(s); };
      if (!calm && i) break;
      const a = r(1) * Math.PI * 2, len = (18 + r(2) * 22) * u;
      ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 1; j <= 3; j++) ctx.lineTo(x + Math.cos(a) * len * j / 3 + (r(3 + j) - 0.5) * 12 * u, y + Math.sin(a) * len * j / 3 + (r(6 + j) - 0.5) * 12 * u);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawCastSparkle(ctx, doll, time, w, h) {
  const colors = doll.sparkle || ['#ffd23f', '#fff'];
  for (let i = 0; i < 7; i++) {
    const a = time * 4 + i * 0.9, r = w * 0.35 + Math.sin(time * 6 + i) * 10;
    ctx.fillStyle = colors[i % colors.length]; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(w * 0.3 + Math.cos(a) * r * 0.5, -h * 0.55 + Math.sin(a) * r * 0.5, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawLabel(ctx, doll) {
  ctx.save();
  ctx.font = '800 44px "Baloo 2", ui-rounded, "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'center';
  const t = doll.label, tw = ctx.measureText(t).width + 40, x = doll.x, y = doll.y - doll.height - 36;
  ctx.fillStyle = 'rgba(255,255,255,.85)'; roundRect(ctx, x - tw / 2, y - 44, tw, 60, 18); ctx.fill();
  ctx.fillStyle = doll.labelColor || '#3e3a4f'; ctx.fillText(t, x, y);
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* A hero: a doll whose look comes from her princess kind and what she wears. */
class HeroSprite extends Doll {
  constructor(seat) { super(); this.seat = seat; this.kind = null; }
  async setKind(kind, equipped = {}) {
    this.kind = kind;
    const paths = {};
    const fullBase = 'art/heroes/' + kind + '/full';
    if (artFile(fullBase)) paths.body = fullBase;   // one painted figure
    else for (const l of DOLL_LAYERS) paths[l] = 'art/heroes/' + kind + '/' + l;
    for (const [slot, item] of Object.entries(equipped)) {       // worn items swap their own layers in
      const layer = { hand: 'hand', head: 'head', back: 'back', feet: null }[slot];
      if (layer && item) paths[layer] = 'art/items/' + item + '/' + layer;
    }
    const sparkles = { fire: ['#ffd23f', '#ff7a3d'], flower: ['#ff8fb8', '#9fd08a'], electric: ['#9ad0ff', '#fff6a8'] };
    this.sparkle = sparkles[kind];
    await this.load(paths);
    // a painted princess is a living painting; her pose paintings swap in when they are listed in art/overrides.js
    this.painted = !!artFile(fullBase) && Object.keys(paths).length === 1;
    this.motion = (WORLD.heroes[kind] && WORLD.heroes[kind].motion) || null;
    this.poses = {};
    if (this.painted) for (const pose of HERO_POSES) { const b = 'art/heroes/' + kind + '/' + pose; if (artFile(b)) { const img = await loadImage(b); if (img) this.poses[pose] = img; } }
  }
}
/* Someone who is not a hero: a single picture. */
class NpcSprite extends Doll {
  constructor(id, x) { super(); this.id = id; this.x = x; this.height = HERO_HEIGHT * 1.05; }
  async setArt(art) { await this.load({ body: 'art/npcs/' + art }); this.painted = !!artFile('art/npcs/' + art); this.motion = { hair: 0.6, skirt: 0.7 }; }   // painted townsfolk breathe and sway too
}

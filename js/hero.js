'use strict';
/* Ember Bloom: heroes and other people on the stage, drawn as paper dolls.
   A paper doll is a stack of pictures (back, body, outfit, face, hair, head, hand), 400 x 600 each, feet on the
   bottom edge, facing right. Items a hero wears can swap in their own layer pictures. Animations are small
   and friendly: an idle bob, a walking wobble, a cast pose, a happy hop, sleeping. */

const DOLL_LAYERS = ['back', 'body', 'outfit', 'face', 'hair', 'head', 'hand'];

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
      const d = this.target - this.x, step = WALK_SPEED * dt;
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
    if (this.label) drawLabel(ctx, this);
  }
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
  ctx.font = '900 44px ui-rounded, "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'center';
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
    for (const l of DOLL_LAYERS) paths[l] = 'art/heroes/' + kind + '/' + l;
    for (const [slot, item] of Object.entries(equipped)) {       // worn items swap their own layers in
      const layer = { hand: 'hand', head: 'head', back: 'back', feet: null }[slot];
      if (layer && item) paths[layer] = 'art/items/' + item + '/' + layer;
    }
    const sparkles = { fire: ['#ffd23f', '#ff7a3d'], flower: ['#ff8fb8', '#9fd08a'], electric: ['#9ad0ff', '#fff6a8'] };
    this.sparkle = sparkles[kind];
    await this.load(paths);
  }
}
/* Someone who is not a hero: a single picture. */
class NpcSprite extends Doll {
  constructor(id, x) { super(); this.id = id; this.x = x; this.height = HERO_HEIGHT * 1.05; }
  async setArt(art) { await this.load({ body: 'art/npcs/' + art }); }
}

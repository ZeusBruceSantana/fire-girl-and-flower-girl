'use strict';
/* Ember Bloom: the storybook scene renderer.
   A scene is four painted layers (sky, far, mid, near) on a 2560 x 1440 canvas, a walk path and hotspots
   (all in data/scenes.js). Heroes walk along the path when tapped. The camera follows the heroes with a
   little parallax. Everything draws on one <canvas>; buttons and speech bubbles are ordinary HTML above it.

   Art files: art/scenes/<id>/<layer>.png beats .svg if both exist (purchased art replaces placeholders). */

const PARALLAX = { sky: 0.1, far: 0.3, mid: 0.6, near: 1.0 };
const HERO_HEIGHT = 480;                 // scene pixels (a third of the scene)
const WALK_SPEED = 520;                  // scene pixels per second

/* ---------- loading pictures, png first then svg, never failing ---------- */
const imageCache = {};
function loadImage(base) {
  if (imageCache[base]) return imageCache[base];
  const p = new Promise(resolve => {
    const tryExt = exts => {
      if (!exts.length) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => tryExt(exts.slice(1));
      img.src = base + '.' + exts[0] + (TEST_MODE ? '' : '?v=' + ART_VERSION);
    };
    // Purchased .png art is used when its path is listed in art/overrides.js; otherwise the .svg placeholder.
    tryExt((typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(base)) ? ['png', 'svg'] : ['svg']);
  });
  imageCache[base] = p;
  return p;
}
const ART_VERSION = '1';

/* ---------- the stage ---------- */
const Stage = {
  canvas: null, ctx: null,
  scene: null,            // the SCENES entry on screen
  layers: {},             // layer name -> Image
  cam: { x: 1280, y: 720 },
  scale: 1, visW: 2560, visH: 1440,
  heroes: {},             // seat -> HeroSprite
  npcs: [],               // { id, img, x }
  particles: [],
  fade: 1,                // 1 = fully black (start), 0 = clear
  fadeTarget: 0,
  time: 0,
  ready: false,
  onArrive: null,         // cb(seat, hotspot) when a hero reaches a hotspot
};

function stageInit(canvas) {
  Stage.canvas = canvas;
  Stage.ctx = canvas.getContext('2d');
  stageResize();
  addEventListener('resize', stageResize);
  let last = performance.now();
  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    stageUpdate(dt, now);
    stageDraw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function stageResize() {
  const c = Stage.canvas, dpr = Math.min(2, devicePixelRatio || 1);
  c.width = Math.round(innerWidth * dpr); c.height = Math.round(innerHeight * dpr);
  c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
  Stage.dpr = dpr;
  // "cover": the scene always fills the screen; a narrower screen sees less of the width
  Stage.scale = Math.max(c.width / SCENE_SIZE.w, c.height / SCENE_SIZE.h);
  Stage.visW = c.width / Stage.scale; Stage.visH = c.height / Stage.scale;
}

/* Go to a scene. Heroes appear at their spawn points (or at a given x). Returns when the art has loaded. */
async function stageGo(sceneId, { positions = {} } = {}) {
  const def = SCENES[sceneId];
  if (!def) return;
  Stage.fadeTarget = 1;
  await Promise.all([loadLayers(sceneId, def), sleepMs(Stage.ready ? 260 : 0)]);
  Stage.scene = Object.assign({ id: sceneId }, def);
  Stage.particles = [];
  for (const seat of WORLD.seats) {
    const h = Stage.heroes[seat];
    if (!h) continue;
    const x = positions[seat] != null ? positions[seat] : def.spawn[seat];
    h.placeOnPath(x);
    h.target = null; h.anim = 'idle';
    if (isPlayerHere(seat) && h.visible) setPresence(seat, { scene: sceneId, x: h.x, anim: 'idle', facing: h.facing, driver: 'player' });
    else if (S.settings.localSeats.includes(seat)) { P[seat].scene = null; }   // a local seat nobody is playing: the companion brings her along
  }
  Stage.cam.x = cameraTargetX();
  Stage.fadeTarget = 0;
  Stage.ready = true;
  setScene('world');
  document.body.dataset.place = sceneId;
  uiSceneName(def.word);
}
async function loadLayers(id, def) {
  // A purchased painting is one file, art/scenes/<id>/full.png (listed in art/overrides.js). It replaces all four
  // placeholder layers and gets a gentle camera drift instead of parallax.
  const fullBase = 'art/scenes/' + id + '/full';
  if (typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(fullBase)) {
    const img = await loadImage(fullBase);
    if (img) { Stage.layers = { full: img }; return; }
  }
  const entries = await Promise.all(def.layers.map(async l => [l, await loadImage('art/scenes/' + id + '/' + l)]));
  Stage.layers = Object.fromEntries(entries);
}
const sleepMs = ms => new Promise(r => setTimeout(r, ms));

/* ---------- geometry ---------- */
function pathY(path, x) {
  if (x <= path[0][0]) return path[0][1];
  for (let i = 1; i < path.length; i++) {
    if (x <= path[i][0]) { const [x0, y0] = path[i - 1], [x1, y1] = path[i]; return lerp(y0, y1, (x - x0) / (x1 - x0)); }
  }
  return path[path.length - 1][1];
}
function pathBounds(path) { return [path[0][0], path[path.length - 1][0]]; }
function cameraTargetX() {
  const local = S.settings.localSeats.filter(isPlayerHere).map(s => Stage.heroes[s]).filter(h => h && h.visible);
  const xs = local.length ? local.map(h => h.x) : [SCENE_SIZE.w / 2];
  const mid = xs.reduce((a, b) => a + b, 0) / xs.length;
  return clamp(mid, Stage.visW / 2, SCENE_SIZE.w - Stage.visW / 2);
}
/* Screen pixel -> scene coordinates (on the near plane). */
function screenToScene(px, py) {
  const left = Stage.cam.x - Stage.visW / 2, top = Stage.cam.y - Stage.visH / 2;
  return [left + px * Stage.dpr / Stage.scale, top + py * Stage.dpr / Stage.scale];
}
function hotspotAt(x, y) {
  if (!Stage.scene) return null;
  return Stage.scene.hotspots.find(h => x >= h.rect[0] && x <= h.rect[0] + h.rect[2] && y >= h.rect[1] && y <= h.rect[1] + h.rect[3]) || null;
}

/* ---------- update ---------- */
function stageUpdate(dt, now) {
  Stage.time += dt;
  Stage.fade = lerp(Stage.fade, Stage.fadeTarget, Math.min(1, dt * 6));
  if (!Stage.scene) return;
  for (const seat of WORLD.seats) {
    const h = Stage.heroes[seat];
    if (!h || !h.visible) continue;
    const mine = isPlayerHere(seat);
    if (!mine) {                                   // driven elsewhere (another device, or the companion): follow presence
      const p = P[seat];
      if (p.scene !== Stage.scene.id) { h.visible = false; continue; }
      if (p.target != null && h.target == null) { h.target = p.target; P[seat].target = null; }
      else if (p.x != null && h.target == null && Math.abs(p.x - h.x) > 40 && p.driver === 'player') h.target = p.x;
    }
    h.update(dt, Stage.scene.path);
    if (mine && (h.anim === 'walk' || h.justStopped)) setPresence(seat, { x: Math.round(h.x), anim: h.anim, facing: h.facing });
    if (h.justStopped) {
      h.justStopped = false;
      if (h.pendingHotspot && Stage.onArrive) { const hs = h.pendingHotspot; h.pendingHotspot = null; Stage.onArrive(seat, hs); }
    }
    if (!mine) { if (!(P[seat].scene === Stage.scene.id)) h.visible = false; else h.visible = true; }
  }
  for (const seat of WORLD.seats) {                 // others arriving into this scene
    const h = Stage.heroes[seat];
    if (h && !isPlayerHere(seat) && !h.visible && P[seat].scene === Stage.scene.id && (S.heroes[seat].kind || WORLD.defaultSides[seat])) {
      h.visible = true; h.placeOnPath(P[seat].x || Stage.scene.spawn[seat]);
    }
  }
  Stage.cam.x = lerp(Stage.cam.x, cameraTargetX(), Math.min(1, dt * 3));
  Stage.cam.y = clamp(SCENE_SIZE.h / 2, Stage.visH / 2, SCENE_SIZE.h - Stage.visH / 2);
  updateParticles(dt, now);
  presenceTick(now);
  if (Math.floor(Stage.time * 2) !== Math.floor((Stage.time - dt) * 2)) companionTick(now);
}

/* ---------- particles: the small ambient magic of each place ---------- */
const PARTICLE_LOOKS = {
  embers:    { color: ['#ffb347', '#ff7a3d'], size: [6, 14], vy: [-40, -90], vx: [-20, 20], life: [2, 4], rate: 6, glow: true },
  petals:    { color: ['#ffb3cf', '#ff8fb8', '#fff0f5'], size: [12, 22], vy: [30, 70], vx: [-40, 40], life: [5, 9], rate: 3, spin: true },
  sparks:    { color: ['#fff6a8', '#9ad0ff'], size: [4, 9], vy: [-60, 60], vx: [-60, 60], life: [0.4, 1], rate: 10, glow: true },
  fireflies: { color: ['#f3ffa3'], size: [6, 10], vy: [-15, 15], vx: [-15, 15], life: [4, 8], rate: 3, glow: true, blink: true },
  dust:      { color: ['#fff8e6'], size: [4, 8], vy: [-6, 6], vx: [-10, 10], life: [6, 10], rate: 2, glow: true },
  leaves:    { color: ['#9fd08a', '#c9e27a', '#ffd27a'], size: [10, 18], vy: [40, 80], vx: [-50, 10], life: [5, 9], rate: 3, spin: true },
  bubbles:   { color: ['#dff4ff'], size: [6, 16], vy: [-30, -70], vx: [-10, 10], life: [3, 6], rate: 2, ring: true },
};
const rnd = (a, b) => a + Math.random() * (b - a);
function updateParticles(dt, now) {
  const look = PARTICLE_LOOKS[Stage.scene.particles];
  if (!look) return;
  if (Stage.particles.length < 60 && Math.random() < look.rate * dt) {
    const w = SCENE_SIZE.w, h = SCENE_SIZE.h;
    Stage.particles.push({ x: rnd(0, w), y: look.vy[0] < 0 ? rnd(h * 0.4, h) : rnd(-50, h * 0.3), vx: rnd(...look.vx), vy: rnd(...look.vy),
      size: rnd(...look.size), color: look.color[Math.floor(Math.random() * look.color.length)], life: rnd(...look.life), age: 0, phase: Math.random() * 7 });
  }
  for (const p of Stage.particles) { p.age += dt; p.x += (p.vx + Math.sin(now / 900 + p.phase) * 18) * dt; p.y += p.vy * dt; }
  Stage.particles = Stage.particles.filter(p => p.age < p.life);
}

/* ---------- draw ---------- */
const TINTS = {
  morning: ['rgba(255,214,160,0.16)', 'rgba(255,255,255,0)'],
  day:     null,
  evening: ['rgba(255,170,120,0.18)', 'rgba(120,80,160,0.12)'],
  night:   ['rgba(30,40,110,0.42)', 'rgba(20,20,60,0.5)'],
  lantern: ['rgba(255,190,100,0.12)', 'rgba(40,20,0,0.28)'],
  none:    null,
};
function stageDraw() {
  const ctx = Stage.ctx, c = Stage.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, c.width, c.height);
  if (!Stage.scene) { drawFade(ctx, c); return; }
  const s = Stage.scale, left = Stage.cam.x - Stage.visW / 2, top = Stage.cam.y - Stage.visH / 2;
  const panX = left, panY = top;                       // how far the camera has moved from the scene's left/top
  // layers, back to front, each panning by its own factor
  if (Stage.layers.full) drawFull(ctx, panX, panY, s); else for (const name of ['sky', 'far', 'mid']) drawLayer(ctx, name, panX, panY, s);
  // heroes and npcs sorted by foot y (lower on screen = in front)
  const actors = [...Object.values(Stage.heroes).filter(h => h.visible), ...Stage.npcs];
  actors.sort((a, b) => a.y - b.y);
  ctx.setTransform(s, 0, 0, s, -panX * s, -panY * s);
  for (const a of actors) a.draw(ctx, Stage.time);
  drawParticles(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawLayer(ctx, 'near', panX, panY, s);
  drawLightShafts(ctx, c, panX, s);
  const tint = TINTS[Stage.scene.tint];
  if (tint) { const g = ctx.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, tint[0]); g.addColorStop(1, tint[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height); }
  drawVignette(ctx, c);
  if (QUERY.has('debug')) drawDebug(ctx, panX, panY, s);
  drawFade(ctx, c);
}
/* One painting: drawn a touch larger than the scene and drifting very slowly, so it still feels alive. */
function drawFull(ctx, panX, panY, s) {
  const img = Stage.layers.full, grow = 1.03;
  const w = SCENE_SIZE.w * s * grow, h = SCENE_SIZE.h * s * grow;
  const driftX = Math.sin(Stage.time * 0.15) * 0.5 + 0.5, driftY = Math.cos(Stage.time * 0.11) * 0.5 + 0.5;
  const dx = -panX * s - (w - SCENE_SIZE.w * s) * driftX, dy = -panY * s - (h - SCENE_SIZE.h * s) * driftY;
  ctx.drawImage(img, dx, dy, w, h);
}
function drawLayer(ctx, name, panX, panY, s) {
  const img = Stage.layers[name];
  if (!img) return;
  const f = PARALLAX[name];
  // the layer moves less than the camera; it is always wide enough because the pan never exceeds (scene - visible)
  const dx = -panX * f * s, dy = -panY * f * s;
  ctx.drawImage(img, dx, dy, SCENE_SIZE.w * s, SCENE_SIZE.h * s);
}
function drawParticles(ctx) {
  for (const p of Stage.particles) {
    const t = p.age / p.life, a = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = p.color;
    if (PARTICLE_LOOKS[Stage.scene.particles].glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 18; }
    ctx.beginPath();
    if (PARTICLE_LOOKS[Stage.scene.particles].spin) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.age * 2 + p.phase); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    else { ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}
/* Soft light shafts for sunny and lantern-lit places: slow, wide, barely there. */
const SHAFT_SCENES = { day: 'rgba(255,245,210,', morning: 'rgba(255,230,190,', lantern: 'rgba(255,200,120,', evening: 'rgba(255,200,150,' };
function drawLightShafts(ctx, c, panX, s) {
  const col = SHAFT_SCENES[Stage.scene.tint];
  if (!col) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const t = Stage.time * 0.08 + i * 1.7;
    const x = ((i * 0.27 + 0.1 + Math.sin(t) * 0.04) * SCENE_SIZE.w - panX * 0.4) * s;
    const w = c.height * 0.35, a = 0.035 + Math.sin(t * 1.3) * 0.015;
    const g = ctx.createLinearGradient(x, 0, x + w * 0.5, c.height);
    g.addColorStop(0, col + a + ')'); g.addColorStop(1, col + '0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w * 0.6, 0); ctx.lineTo(x + w * 1.4, c.height); ctx.lineTo(x + w * 0.2, c.height); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
/* A gentle darkening at the edges pulls the eye to the middle and makes any painting feel finished. */
function drawVignette(ctx, c) {
  const g = ctx.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.45, c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.75);
  g.addColorStop(0, 'rgba(20,10,0,0)'); g.addColorStop(1, 'rgba(20,10,0,0.28)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
}
function drawFade(ctx, c) {
  if (Stage.fade < 0.01) return;
  ctx.globalAlpha = Stage.fade; ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, c.width, c.height); ctx.globalAlpha = 1;
}
function drawDebug(ctx, panX, panY, s) {
  ctx.setTransform(s, 0, 0, s, -panX * s, -panY * s);
  ctx.strokeStyle = 'rgba(255,0,0,.6)'; ctx.lineWidth = 4;
  for (const h of Stage.scene.hotspots) ctx.strokeRect(...h.rect);
  ctx.strokeStyle = 'rgba(0,120,255,.8)'; ctx.beginPath(); Stage.scene.path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

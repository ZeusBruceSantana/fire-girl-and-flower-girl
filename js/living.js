'use strict';
/* Ember Bloom: living paintings. Everything that makes a still painting move, in one place, from data/living.js.

   Rooms (drawn by scene.js through Living.drawRoom):
     - depth: the painting is drawn in horizontal bands; the floor moves with the camera, the back wall a little
       less, so walking (and a slow breath of the camera) tilts the room like a pop-up book. The floor never slides
       under the princesses.
     - jelly tap: a tap makes the painting ripple out from the finger and settle (the princesses' world answers).
     - sunlight that wanders across the room, lanterns and candles that glow and pulse, water that ripples,
       waterfalls that flow, chimney smoke, embers, bees, sparks and fireflies.
   Maps (map.js): the same water, lights and little lives, plus cloud shadows and birds passing over.
   Everyone: Fire Girl's flame lights up dark places around her, Flower Girl leaves petals where she walks,
   Electric Girl makes lanterns near her flicker.
   Between places: the old picture turns away like a page of a storybook.

   Cheap on a tablet: drawImage and pre-drawn glow pictures only, no canvas shadow blur; reduced motion keeps the
   paintings still (lights still glow, nothing ripples, the page turn becomes a fade). */

const Living = {
  ripples: [],                 // jelly taps: { x, y, t0 } in scene units
  petals: [],                  // Flower Girl's footprints: { x, y, t0, r }
  lastPetal: 0,
  turn: null,                  // the page being turned: { snap: canvas, t0 }
  sunSprite: null, cloudSprite: null,

  init() {
    onStageTap(t => { if (!Stage.map && Stage.scene && Stage.layers.full) this.poke(t.x, t.y); });
  },
  calm() { return reducedMotion(); },
  def() { return LIVING[Stage.map ? 'map:' + Stage.map.map.id : Stage.scene && Stage.scene.id] || {}; },
  poke(x, y) { if (this.calm()) return; this.ripples.push({ x, y, t0: Stage.time }); if (this.ripples.length > 4) this.ripples.shift(); },

  /* ---------- rooms ---------- */
  /* The painting in depth bands, then any jelly ripples on top. Scene y is kept exact at the floor line, so the
     princesses stand where they always stood. */
  drawRoom(ctx, img, panX, panY, s) {
    const W = SCENE_SIZE.w, H = SCENE_SIZE.h, grow = 1.1, floor = 1280, iw = img.width, ih = img.height;
    const calm = this.calm(), t = Stage.time;
    const breath = calm ? 0 : Math.sin(t * 0.17) * 70 + Math.sin(t * 0.07) * 40;    // the camera breathing, in scene units
    const depthAt = v => v >= 0.8 ? 1 : 0.62 + 0.38 * Math.pow(v / 0.8, 1.4);        // back wall 0.62 ... floor 1
    const imgX = x => ((x - W / 2) / grow + W / 2) / W * iw, imgY = y => ((y - floor) / grow + floor) / H * ih;
    const left0 = W / 2 - W / 2 * grow;                                              // where the grown painting starts
    const shiftFor = d => -(panX * d + breath * (1 - d) * 1.6);                      // scene-unit shift of a band
    const N = 30;
    for (let i = 0; i < N; i++) {
      const y0 = H * i / N, y1 = H * (i + 1) / N, d = depthAt((i + 0.5) / N);
      const sy0 = imgY(y0), sy1 = imgY(y1);
      ctx.drawImage(img, 0, sy0, iw, sy1 - sy0, (left0 + shiftFor(d)) * s, (y0 - panY) * s, W * grow * s, (y1 - y0) * s + 0.75);
    }
    // jelly ripples: tiles near the tap, pushed out along a ring that travels and fades
    this.ripples = this.ripples.filter(r => t - r.t0 < 1.7);
    const T = 48, R = 380;
    for (const r of this.ripples) {
      const age = t - r.t0, fade = Math.exp(-age * 2.4);
      for (let ty = Math.max(0, r.y - R); ty < Math.min(H, r.y + R); ty += T) for (let tx = Math.max(0, r.x - R); tx < Math.min(W, r.x + R); tx += T) {
        const cx = tx + T / 2, cy = ty + T / 2, dist = Math.hypot(cx - r.x, cy - r.y);
        if (dist > R) continue;
        const amp = 30 * fade * (1 - dist / R) * Math.sin(dist * 0.04 - age * 12), ux = dist ? (cx - r.x) / dist : 0, uy = dist ? (cy - r.y) / dist : 0;
        const d = depthAt(cy / H), sh = shiftFor(d), scale = 1 + Math.abs(amp) * 0.006;
        const sx = imgX(tx), sy = imgY(ty), sw = imgX(tx + T) - sx, shh = imgY(ty + T) - sy;
        const dw = T * scale, dh = T * scale;
        ctx.drawImage(img, sx, sy, sw, shh, (tx + sh + ux * amp - (dw - T) / 2) * s, (ty - panY + uy * amp - (dh - T) / 2) * s, dw * s + 0.5, dh * s + 0.5);
      }
    }
    this.room = { img, panX, panY, s, imgX, imgY, shiftFor, depthAt };
    const def = this.def();
    if (def.water) for (const w of def.water) this.drawWater(ctx, w, true);
  },

  /* Water: a ripple shimmers the painted water sideways in thin bands with glints; a fall streams downward. */
  drawWater(ctx, [x, y, w, h, kind], room) {
    if (this.calm()) return;
    const t = Stage.time;
    if (kind === 'fall') {
      ctx.save(); this.toWorld(ctx);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const k = ((t * 0.9 + i * 0.37) % 1), lx = x + w * ((i * 0.618) % 1), ly = y + k * h;
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.35; ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx, ly, Math.max(3, w * 0.05), h * 0.18);
      }
      ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t * 5); drawGlow(ctx, x + w / 2, y + h, Math.max(w, 40), '#e8f6ff', 0.6);
      ctx.restore(); return;
    }
    // ripple: re-draw the water region in thin bands, each nudged sideways by a travelling wave
    const band = room ? 6 : 10;
    if (room) {
      const r = this.room; if (!r) return;
      for (let yy = y; yy < y + h; yy += band) {
        const off = Math.sin(yy * 0.09 + t * 2.4) * 5 + Math.sin(yy * 0.031 - t * 1.3) * 3, d = r.depthAt(yy / SCENE_SIZE.h), sh = r.shiftFor(d);
        const sx = r.imgX(x), sy = r.imgY(yy), sw = r.imgX(x + w) - sx, shh = r.imgY(yy + band) - sy;
        ctx.drawImage(r.img, sx, sy, sw, shh, (x + sh + off) * r.s, (yy - r.panY) * r.s, w * r.s, band * r.s + 0.6);
      }
    } else {
      const m = Stage.map, img = m.img; if (!img) return;
      const [mw, mh] = m.map.size, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = m.scale;
      const left = m.cam.x - m.visW / 2, top = m.cam.y - m.visH / 2;
      const y0 = Math.max(y, top), y1 = Math.min(y + h, top + m.visH), x0 = Math.max(x, left), x1 = Math.min(x + w, left + m.visW);
      if (y1 <= y0 || x1 <= x0) return;
      for (let yy = y0; yy < y1; yy += band) {
        const off = Math.sin(yy * 0.05 + t * 2) * 6 + Math.sin(yy * 0.017 - t * 1.1) * 4;
        ctx.drawImage(img, x0 * iw / mw, yy * ih / mh, (x1 - x0) * iw / mw, band * ih / mh, (x0 - left + off) * s, (yy - top) * s, (x1 - x0) * s, band * s + 0.6);
      }
    }
    // glints: little points of light that blink on the water
    ctx.save(); this.toWorld(ctx); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < Math.min(14, Math.ceil(w * h / 40000) + 3); i++) {
      const k = (t * 0.6 + i * 0.29) % 1, gx = x + w * ((i * 0.618 + Math.floor(t * 0.6 + i * 0.29) * 0.37) % 1), gy = y + h * ((i * 0.414 + 0.2) % 1);
      ctx.globalAlpha = Math.max(0, Math.sin(k * Math.PI)) * 0.7; ctx.fillStyle = '#fffdf0';
      ctx.beginPath(); ctx.ellipse(gx, gy, 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },
  /* Set the canvas to scene or map units (as the actors are drawn). */
  toWorld(ctx) {
    if (Stage.map) { const m = Stage.map, s = m.scale; ctx.setTransform(s, 0, 0, s, -(m.cam.x - m.visW / 2) * s, -(m.cam.y - m.visH / 2) * s); }
    else { const s = Stage.scale; ctx.setTransform(s, 0, 0, s, -(Stage.cam.x - Stage.visW / 2) * s, -(Stage.cam.y - Stage.visH / 2) * s); }
  },

  /* ---------- lights, little lives and magic, drawn after the actors in world units ---------- */
  drawWorld(ctx) {
    const def = this.def(), t = Stage.time, calm = this.calm();
    ctx.save(); this.toWorld(ctx);
    const heroes = Object.values(Stage.heroes).filter(h => h && h.visible);
    const electric = heroes.find(h => h.kind === 'electric');
    // lanterns, candles, windows: a soft pulse; an Electric Girl nearby makes them flicker
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, r, color] of def.lights || []) {
      let a = 0.42 + (calm ? 0 : 0.1 * Math.sin(t * 2.3 + x * 0.01) + 0.05 * Math.sin(t * 9.1 + y));
      if (electric && !calm && Math.hypot(electric.x - x, electric.y - y) < 520) a *= 0.55 + 0.9 * ((Math.sin(t * 31 + x) * Math.sin(t * 17.3)) > 0 ? 1 : 0.35);
      ctx.globalAlpha = a; drawGlow(ctx, x, y, r, color || '#ffcf7a', 1);
    }
    ctx.globalAlpha = 1;
    // the little lives: smoke, embers, bees, sparks, fireflies
    if (!calm) for (const [x, y, kind] of def.life || []) this.drawLife(ctx, x, y, kind, t);
    // Fire Girl's flame lights the dark around her
    const dark = Stage.map ? false : ['lantern', 'night', 'evening'].includes(Stage.clockTint && Stage.scene.tint !== 'lantern' ? Stage.clockTint : Stage.scene && Stage.scene.tint);
    for (const h of heroes) {
      if (h.kind !== 'fire' || !h.painted || !h.motion) continue;
      const [ax, ay] = h.motion.at, hw = h.height * (h.layers.body.width / h.layers.body.height);
      const hx = h.x + h.facing * (ax - 0.5) * hw, hy = h.y - (1 - ay) * h.height;
      const flick = calm ? 1 : 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.7);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (dark ? 0.55 : 0.22) * flick;
      drawGlow(ctx, hx, hy, h.height * (dark ? 1.1 : 0.6), '#ffb45a', 1);
    }
    // Flower Girl's petals where she walked
    for (const h of heroes) if (h.kind === 'flower' && h.anim === 'walk' && !calm && t - this.lastPetal > 0.22) { this.lastPetal = t; this.petals.push({ x: h.x + (Math.random() - 0.5) * h.height * 0.2, y: h.y - 2, t0: t, r: Math.random() * 6 }); }
    this.petals = this.petals.filter(p => t - p.t0 < 2.6 && (Stage.map ? true : !p.map));
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.petals) {
      const k = (t - p.t0) / 2.6, u = Stage.map ? 0.5 : 1;
      ctx.globalAlpha = (1 - k) * 0.9; ctx.fillStyle = p.r > 3 ? '#ff8fb8' : '#ffc4dc';
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r + k); ctx.beginPath(); ctx.ellipse(0, 0, 9 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  },
  drawLife(ctx, x, y, kind, t) {
    const R = (i, n) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    if (kind === 'smoke') {                                            // chimney smoke: puffs that rise, grow and fade
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 6; i++) { const k = (t * 0.18 + i / 6) % 1; ctx.globalAlpha = (1 - k) * 0.35; ctx.fillStyle = '#f4f0ea';
        ctx.beginPath(); ctx.arc(x + Math.sin(k * 5 + i) * 18 + k * 40, y - k * 260, 14 + k * 46, 0, Math.PI * 2); ctx.fill(); }
    } else if (kind === 'embers') {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) { const k = (t * 0.5 + i * 0.1) % 1; ctx.globalAlpha = (1 - k) * 0.9; ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff7a3d';
        ctx.beginPath(); ctx.arc(x + (R(i, 1) - 0.5) * 120 + Math.sin(t * 2 + i) * 14, y - k * 180, 4 + R(i, 2) * 3, 0, Math.PI * 2); ctx.fill(); }
    } else if (kind === 'bees') {
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 5; i++) { const a = t * (1.6 + R(i, 3)) + i * 1.3; ctx.globalAlpha = 1; ctx.fillStyle = '#ffcc33';
        const bx = x + Math.cos(a) * (60 + 30 * R(i, 4)), by = y + Math.sin(a * 1.7) * 30; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(bx - 3, by - 6, 5, 3, 0.5, 0, Math.PI * 2); ctx.fill(); }
    } else if (kind === 'sparks') {
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#dff1ff'; ctx.lineWidth = 4; const tick = Math.floor(t * 9);
      for (let i = 0; i < 3; i++) { if (R(tick, i) > 0.55) continue; const a = R(tick, i + 5) * Math.PI * 2, L = 60 + R(tick, i + 9) * 60; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.moveTo(x, y); for (let j = 1; j <= 3; j++) ctx.lineTo(x + Math.cos(a) * L * j / 3 + (R(tick, i * 3 + j) - 0.5) * 30, y + Math.sin(a) * L * j / 3 + (R(tick, i * 7 + j) - 0.5) * 30); ctx.stroke(); }
    } else if (kind === 'fireflies') {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) { const a = t * 0.4 + i * 2.1; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
        drawGlow(ctx, x + Math.cos(a) * 160 * R(i, 1) + Math.sin(a * 2.3) * 40, y + Math.sin(a * 1.3) * 90 * R(i, 2), 22, '#fff3a0', 1); }
    }
    ctx.globalAlpha = 1;
  },

  /* ---------- screen-wide light ---------- */
  /* Warm sunlight wandering slowly across a room (screen units, after the painting, before the time-of-day tint). */
  drawSun(ctx, c) {
    const def = this.def(); if (!def.sun) return;
    if (!this.sunSprite) { const k = document.createElement('canvas'); k.width = k.height = 256; const g = k.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(0.5, 'rgba(255,214,150,.45)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); this.sunSprite = k; }
    const t = Stage.time, calm = this.calm(), r = c.height * 0.9;
    const x = c.width * (0.5 + (calm ? 0.2 : 0.38 * Math.sin(t * 0.05))), y = c.height * (0.3 + (calm ? 0 : 0.08 * Math.sin(t * 0.08)));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.55;
    ctx.drawImage(this.sunSprite, x - r, y - r, r * 2, r * 2); ctx.restore();
  },

  /* ---------- maps: cloud shadows and birds (screen-wide, over the painting and the party) ---------- */
  drawSky(ctx, c) {
    if (this.calm()) return;
    const m = Stage.map, def = this.def(); if (!m || def.clouds === false) return;
    if (!this.cloudSprite) { const k = document.createElement('canvas'); k.width = 1024; k.height = 640; const g = k.getContext('2d');
      for (let i = 0; i < 9; i++) { const cx = 120 + (i * 397) % 820, cy = 100 + (i * 233) % 440, r = 90 + (i * 53) % 110, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, 'rgba(20,30,60,.9)'); gr.addColorStop(1, 'rgba(20,30,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }
      this.cloudSprite = k; }
    const t = Stage.time, s = m.scale, left = m.cam.x - m.visW / 2, top = m.cam.y - m.visH / 2;
    const tw = 2600, th = 1625, ox = ((t * 38) % tw), oy = ((t * 14) % th);       // clouds drift slowly across the map
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.16;
    for (let gx = Math.floor((left - ox) / tw) * tw + ox; gx < left + m.visW; gx += tw) for (let gy = Math.floor((top - oy) / th) * th + oy; gy < top + m.visH; gy += th)
      ctx.drawImage(this.cloudSprite, (gx - left) * s, (gy - top) * s, tw * s, th * s);
    // a little flock of birds crossing every so often
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.75; ctx.strokeStyle = '#3b2f22'; ctx.lineWidth = Math.max(2, c.height * 0.003);
    const period = 16, k = (t % period) / 9;
    if (k < 1) for (let i = 0; i < 3; i++) {
      const bx = c.width * (-0.1 + k * 1.2) - i * c.height * 0.04, by = c.height * (0.35 + 0.1 * Math.sin(Math.floor(t / period))) + Math.sin(k * 7 + i) * c.height * 0.02 + i * c.height * 0.025;
      const flap = Math.sin(t * 12 + i * 2) * c.height * 0.008, sz = c.height * 0.016;
      ctx.beginPath(); ctx.moveTo(bx - sz, by - flap); ctx.quadraticCurveTo(bx - sz / 2, by - sz / 2, bx, by); ctx.quadraticCurveTo(bx + sz / 2, by - sz / 2, bx + sz, by - flap); ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------- the page turn between places ---------- */
  beginTurn() {
    const c = Stage.canvas; if (!c || !Stage.ready || !c.width) { this.turn = null; return; }
    const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; k.getContext('2d').drawImage(c, 0, 0);
    this.turn = { snap: k, t0: null };
  },
  startTurn() { if (this.turn) { this.turn.t0 = Stage.time; Stage.fade = 0; } },
  drawTurn(ctx, c) {
    const tr = this.turn; if (!tr) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (tr.t0 == null) { ctx.drawImage(tr.snap, 0, 0); ctx.restore(); return; }             // still loading the next place
    const dur = this.calm() ? 0.35 : 0.85, k = Math.min(1, (Stage.time - tr.t0) / dur);
    if (k >= 1) { this.turn = null; ctx.restore(); return; }
    if (this.calm()) { ctx.globalAlpha = 1 - k; ctx.drawImage(tr.snap, 0, 0); ctx.restore(); return; }
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, W = c.width, H = c.height;
    const edge = W * (1 - e), curl = Math.min(W * 0.16, (W - edge) * 0.5 + 20);
    // the page still lying flat, left of the fold
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, edge, H); ctx.clip(); ctx.drawImage(tr.snap, 0, 0); ctx.restore();
    // a shadow falling on the next place, right of the curl
    const sh = ctx.createLinearGradient(edge + curl, 0, edge + curl + W * 0.12, 0); sh.addColorStop(0, 'rgba(30,18,6,.45)'); sh.addColorStop(1, 'rgba(30,18,6,0)');
    ctx.fillStyle = sh; ctx.fillRect(edge + curl, 0, W * 0.12, H);
    // the back of the page curling over: the old picture mirrored, washed with parchment
    ctx.save(); ctx.beginPath(); ctx.rect(edge, 0, curl, H); ctx.clip();
    ctx.translate(edge * 2, 0); ctx.scale(-1, 1); ctx.drawImage(tr.snap, 0, 0); ctx.restore();
    const back = ctx.createLinearGradient(edge, 0, edge + curl, 0); back.addColorStop(0, 'rgba(240,226,196,.95)'); back.addColorStop(0.7, 'rgba(250,240,220,.88)'); back.addColorStop(1, 'rgba(200,180,140,.95)');
    ctx.fillStyle = back; ctx.fillRect(edge, 0, curl, H);
    const fold = ctx.createLinearGradient(edge - 18, 0, edge + 6, 0); fold.addColorStop(0, 'rgba(30,18,6,0)'); fold.addColorStop(1, 'rgba(30,18,6,.35)');
    ctx.fillStyle = fold; ctx.fillRect(edge - 18, 0, 24, H);
    ctx.restore();
  },
};

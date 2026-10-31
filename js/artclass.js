'use strict';
/* Ember Bloom: Art class (Miss Palette). The one class where both girls paint on ONE shared canvas.
   Each girl has her own palette strip on her side of the easel, in her element's colors; crafted paints
   from the Bag unlock more. Miss Palette asks for "anything you like" or "paint what this word says"
   (a reading moment with no wrong answer). Done! saves the painting to every painter's gallery.

   Also: ArtClass.offerGift(seat, friendId) at lunch, and ArtClass.gallery(seat) for the Lair wall. */

const ART_UI = {
  anything: 'Paint anything you like!',
  paintWord: 'Paint what this word says:',
  done: 'Done!',
  undo: 'Undo',
  clear: 'Clear mine',
  stamps: 'Stamps',
  brush: 'Brush',
  waiting: 'Waiting for the other painter...',
  saved: 'Painting saved to the gallery!',
  giftAsk: 'Give {friend} your newest painting?',
  giftYes: 'Yes, a gift!',
  giftNo: 'Keep it',
  giftThanks: 'A painting! For me? Thank you!',
  giftLoves: 'A {subject}! My favorite! Thank you, thank you!',
  unlocked: 'New paint: {color}',
};

const PALETTES = {
  fire:     [['#2b2b2b', 'black'], ['#6b6b6b', 'ash grey'], ['#b0a8a0', 'smoke'], ['#ff7a3d', 'ember'], ['#ffb347', 'flame'], ['#ffd23f', 'gold flame']],
  flower:   [['#ff8fb8', 'petal pink'], ['#ffb3cf', 'blossom'], ['#7fd08a', 'leaf green'], ['#3f7a5a', 'deep green'], ['#ffd23f', 'sunflower'], ['#fff0f5', 'cream']],
  electric: [['#9ad0ff', 'light blue'], ['#5aa9ff', 'sky'], ['#fff6a8', 'sparkle'], ['#ffffff', 'white'], ['#c9b3ff', 'lilac'], ['#7a6cf0', 'storm']],
};
// Crafted paints in the bag add a color. Each: item id -> [hex, word, glow?]
const CRAFTED_COLORS = {
  'ash-paint':     ['#141414', 'deep charcoal'],
  'petal-dye':     ['#d6336c', 'magenta'],
  'petal-dye-2':   ['#8e44ad', 'violet'],
  'glow-ink':      ['#39e6ff', 'glow cyan', true],
  'lantern-paint': ['#f0b429', 'lantern gold'],
};
const BRUSHES = [14, 30, 56];
const STAMPS = {
  star:  (ctx, s) => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.4 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); },
  heart: (ctx, s) => { ctx.beginPath(); ctx.moveTo(0, s * 0.9); ctx.bezierCurveTo(-s * 1.3, -s * 0.1, -s * 0.6, -s, 0, -s * 0.4); ctx.bezierCurveTo(s * 0.6, -s, s * 1.3, -s * 0.1, 0, s * 0.9); ctx.closePath(); ctx.fill(); },
  leaf:  (ctx, s) => { ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s, 0, 0, s); ctx.quadraticCurveTo(-s, 0, 0, -s); ctx.closePath(); ctx.fill(); },
  sun:   (ctx, s) => { ctx.beginPath(); ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = s * 0.14; ctx.strokeStyle = ctx.fillStyle; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.7, Math.sin(a) * s * 0.7); ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); ctx.stroke(); } },
};
const STAMP_ICONS = {
  star: '<svg viewBox="0 0 100 100"><path d="M50 8 L60 36 L90 38 L66 56 L74 86 L50 68 L26 86 L34 56 L10 38 L40 36Z" fill="#ffd23f"/></svg>',
  heart: '<svg viewBox="0 0 100 100"><path d="M50 86 C30 70 14 56 14 40 C14 28 24 20 34 20 C42 20 48 26 50 32 C52 26 58 20 66 20 C76 20 86 28 86 40 C86 56 70 70 50 86Z" fill="#ff6f9c"/></svg>',
  leaf: '<svg viewBox="0 0 100 100"><path d="M50 10 Q90 50 50 90 Q10 50 50 10Z" fill="#7fd08a"/></svg>',
  sun: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="#ffd23f"/><g stroke="#ffd23f" stroke-width="8" stroke-linecap="round"><path d="M50 8 V22 M50 78 V92 M8 50 H22 M78 50 H92 M20 20 L30 30 M70 70 L80 80 M20 80 L30 70 M70 30 L80 20"/></g></svg>',
};

const ArtClass = {
  session: null,      // the shared easel while a class is on
  el: null,
  init() { this.el = $('#artclass'); },

  /* The colors a hero can paint with right now. */
  paletteFor(seat) {
    const h = S.heroes[seat];
    const base = (PALETTES[h.kind] || PALETTES.fire).map(([hex, word]) => ({ hex, word, glow: false }));
    const extra = [];
    const have = new Set(h.inventory);
    if (have.has('ash-paint')) extra.push(CRAFTED_COLORS['ash-paint']);
    if (have.has('petal-dye')) { extra.push(CRAFTED_COLORS['petal-dye']); extra.push(CRAFTED_COLORS['petal-dye-2']); }
    if (have.has('glow-ink')) extra.push(CRAFTED_COLORS['glow-ink']);
    if (have.has('lantern-paint')) extra.push(CRAFTED_COLORS['lantern-paint']);
    return base.concat(extra.map(([hex, word, glow]) => ({ hex, word, glow: !!glow, crafted: true })));
  },

  /* ---------- the shared easel ---------- */
  open() {
    if (!this.el) this.init();
    const ses = { seats: [], strokes: {}, tools: {}, live: {}, done: {}, prompts: {}, resolveSave: null };
    this.session = ses;
    this.el.className = 'show';
    this.el.innerHTML = `<div class="easel-wrap">
      <div class="easel-side left"></div>
      <div class="easel"><div class="easel-prompts"></div><canvas class="easel-canvas"></canvas></div>
      <div class="easel-side right"></div></div>`;
    const canvas = this.el.querySelector('.easel-canvas');
    ses.canvas = canvas;
    const rect = this.el.querySelector('.easel').getBoundingClientRect();
    canvas.width = Math.max(200, Math.round(rect.width || 800));
    canvas.height = Math.max(150, Math.round((rect.height || 520) - 70));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ses.ctx = ctx;
    this.bindCanvas(canvas);
    pushLayer('artclass');
  },
  close() {
    this.session = null;
    if (this.el) { this.el.className = ''; this.el.innerHTML = ''; }
    popLayer('artclass');
  },

  /* A seat joins the easel: her palette strip appears on her side. */
  join(seat) {
    const ses = this.session;
    if (!ses || ses.seats.includes(seat)) return;
    ses.seats.push(seat);
    ses.strokes[seat] = [];
    const pal = this.paletteFor(seat);
    ses.tools[seat] = { color: pal[0], size: BRUSHES[1], stamp: null };
    const sideName = ses.seats.length === 1 ? 'left' : (seat === 'right' ? 'right' : (ses.seats[0] === 'right' ? 'left' : 'right'));
    const side = this.el.querySelector('.easel-side.' + sideName);
    side.dataset.seat = seat;
    side.innerHTML = this.paletteHtml(seat, pal);
    this.bindPalette(side, seat);
    const strip = this.el.querySelector('.easel-prompts');
    const p = document.createElement('div');
    p.className = 'prompt seat-' + seat; p.dataset.seat = seat;
    strip.append(p);
  },
  paletteHtml(seat, pal) {
    const t = this.session.tools[seat];
    return `<div class="pal-title">${esc(S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title)}</div>
      <div class="colors">${pal.map((c, i) => `<div class="swatch ${c.crafted ? 'crafted' : ''} ${c.glow ? 'glow' : ''} ${t.color === c ? 'on' : ''}" data-i="${i}" style="--c:${c.hex}" title="${esc(c.word)}"></div>`).join('')}</div>
      <div class="brushes">${BRUSHES.map(b => `<div class="brush ${t.size === b ? 'on' : ''}" data-size="${b}"><span style="width:${b * 0.5}px;height:${b * 0.5}px"></span></div>`).join('')}</div>
      <div class="stamps">${Object.keys(STAMPS).map(k => `<div class="stamp" data-stamp="${k}">${STAMP_ICONS[k]}</div>`).join('')}</div>
      <div class="tools"><div class="tool" data-undo>${esc(ART_UI.undo)}</div><div class="tool" data-clear>${esc(ART_UI.clear)}</div></div>
      <div class="bigbtn done" data-done><span class="icon">${ART.check}</span><span class="word">${esc(ART_UI.done)}</span></div>`;
  },
  bindPalette(side, seat) {
    const ses = this.session, t = ses.tools[seat], pal = this.paletteFor(seat);
    const stop = e => e.stopPropagation();
    side.addEventListener('pointerdown', stop);
    side.querySelectorAll('.swatch').forEach(el => el.addEventListener('pointerdown', e => {
      stop(e); t.color = pal[Number(el.dataset.i)]; t.stamp = null;
      side.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s === el)); side.querySelectorAll('.stamp').forEach(s => s.classList.remove('on'));
      Speech.say(t.color.word, { interrupt: false });
    }));
    side.querySelectorAll('.brush').forEach(el => el.addEventListener('pointerdown', e => {
      stop(e); t.size = Number(el.dataset.size); t.stamp = null;
      side.querySelectorAll('.brush').forEach(s => s.classList.toggle('on', s === el)); side.querySelectorAll('.stamp').forEach(s => s.classList.remove('on'));
    }));
    side.querySelectorAll('.stamp').forEach(el => el.addEventListener('pointerdown', e => {
      stop(e); t.stamp = el.dataset.stamp;
      side.querySelectorAll('.stamp').forEach(s => s.classList.toggle('on', s === el));
      Speech.say(el.dataset.stamp, { interrupt: false });
    }));
    side.querySelector('[data-undo]').addEventListener('pointerdown', e => { stop(e); ses.strokes[seat].pop(); this.redraw(); });
    side.querySelector('[data-clear]').addEventListener('pointerdown', e => { stop(e); ses.strokes[seat] = []; this.redraw(); });
    side.querySelector('[data-done]').addEventListener('pointerdown', e => { stop(e); if (ses.done[seat]) ses.done[seat](); });
  },

  /* ---------- painting ---------- */
  seatForPointer(x) {
    const ses = this.session;
    if (ses.seats.length <= 1) return ses.seats[0];
    const sides = {};
    for (const el of this.el.querySelectorAll('.easel-side')) if (el.dataset.seat) sides[el.classList.contains('left') ? 'left' : 'right'] = el.dataset.seat;
    return x < innerWidth / 2 ? (sides.left || ses.seats[0]) : (sides.right || ses.seats[1]);
  },
  bindCanvas(canvas) {
    canvas.style.touchAction = 'none';
    const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; };
    canvas.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      const ses = this.session; if (!ses) return;
      const seat = this.seatForPointer(e.clientX); if (!seat || !ses.tools[seat]) return;
      const t = ses.tools[seat], [x, y] = pos(e);
      if (t.stamp) { const st = { seat, stamp: t.stamp, color: t.color, size: t.size * 1.6, x, y }; ses.strokes[seat].push(st); this.drawStroke(st); return; }
      const st = { seat, color: t.color, size: t.size, pts: [[x, y]] };
      ses.strokes[seat].push(st); ses.live[e.pointerId] = st;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events have no capture */ }
      this.drawStroke(st);
    });
    canvas.addEventListener('pointermove', e => {
      const ses = this.session; if (!ses) return;
      const st = ses.live[e.pointerId]; if (!st) return;
      e.preventDefault();
      st.pts.push(pos(e)); this.drawSegment(st);
    });
    const up = e => { const ses = this.session; if (ses) delete ses.live[e.pointerId]; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  },
  drawStroke(st) {
    const ctx = this.session.ctx;
    ctx.save();
    ctx.fillStyle = st.color.hex; ctx.strokeStyle = st.color.hex;
    if (st.color.glow) { ctx.shadowColor = st.color.hex; ctx.shadowBlur = 18; }
    if (st.stamp) { ctx.translate(st.x, st.y); STAMPS[st.stamp](ctx, st.size); ctx.restore(); return; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = st.size;
    ctx.beginPath();
    if (st.pts.length === 1) { ctx.arc(st.pts[0][0], st.pts[0][1], st.size / 2, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.moveTo(st.pts[0][0], st.pts[0][1]); for (const p of st.pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke(); }
    ctx.restore();
  },
  drawSegment(st) {
    const ctx = this.session.ctx, n = st.pts.length;
    if (n < 2) return;
    ctx.save();
    ctx.strokeStyle = st.color.hex; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = st.size;
    if (st.color.glow) { ctx.shadowColor = st.color.hex; ctx.shadowBlur = 18; }
    ctx.beginPath(); ctx.moveTo(st.pts[n - 2][0], st.pts[n - 2][1]); ctx.lineTo(st.pts[n - 1][0], st.pts[n - 1][1]); ctx.stroke();
    ctx.restore();
  },
  redraw() {
    const ses = this.session, ctx = ses.ctx;
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, ses.canvas.width, ses.canvas.height);
    for (const seat of ses.seats) for (const st of ses.strokes[seat]) this.drawStroke(st);
  },

  /* ---------- Miss Palette's prompts ---------- */
  setPrompt(seat, i, n, word) {
    const el = this.el.querySelector(`.prompt[data-seat="${seat}"]`);
    if (!el) return;
    el.innerHTML = `<span class="n">${i + 1} / ${n}</span> ${word ? `${esc(ART_UI.paintWord)} <span class="w">${esc(word)}</span>` : esc(ART_UI.anything)}`;
    const w = el.querySelector('.w');
    if (w) w.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(word); });
    Speech.say(word ? ART_UI.paintWord + ' ' + word : ART_UI.anything, { interrupt: false });
  },
  waitDone(seat) { return new Promise(resolve => { this.session.done[seat] = () => { this.session.done[seat] = null; resolve(); }; }); },

  /* Save the easel into every painter's gallery as a small JPEG. */
  snapshot() {
    const ses = this.session, src = ses.canvas;
    const w = Math.min(320, src.width), h = Math.round(src.height * w / src.width);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.drawImage(src, 0, 0, w, h);
    let q = 0.6, img = c.toDataURL('image/jpeg', q);
    while (img.length > 25000 && q > 0.2) { q -= 0.1; img = c.toDataURL('image/jpeg', q); }
    return img;
  },

  /* ---------- lunch gifts and the gallery ---------- */
  gallery(seat) {
    const h = S.heroes[seat];
    const given = S.shared.events.filter(e => e.what === 'gift-painting' && e.hero === seat).map(e => e.index);
    return h.paintings.map((p, i) => ({ day: p.day, subject: p.subject, img: p.img, given: given.includes(i) }));
  },
  async offerGift(seat, friendId) {
    const list = this.gallery(seat).map((p, i) => ({ ...p, i })).filter(p => !p.given);
    if (!list.length) return 0;
    const f = FRIENDS[friendId];
    const newest = list[list.length - 1];
    const pick = await Dialogue.choose({ seat, who: S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title, text: ART_UI.giftAsk.replace('{friend}', f ? f.word : friendId),
      choices: [{ word: ART_UI.giftYes, icon: 'heart', value: 'yes' }, { word: ART_UI.giftNo, icon: 'close', value: 'no' }] });
    if (pick !== 'yes') return 0;
    dispatch('event.add', seat, { what: 'gift-painting', friend: friendId, day: S.shared.clock.day, index: newest.i });
    const loves = f && f.likes && f.likes.paintingOf && newest.subject === f.likes.paintingOf;
    await Dialogue.say({ who: f ? f.word : friendId, art: f && f.art, text: loves ? ART_UI.giftLoves.replace('{subject}', newest.subject) : ART_UI.giftThanks });
    uiToast('+' + (loves ? 5 : 3), { icon: 'heart' });
    return loves ? 5 : 3;
  },
};

/* The Art period for one seat. The first seat to start opens the easel; the others join it. */
async function artClass(seat, n, def) {
  void def;
  if (!ArtClass.session) ArtClass.open();
  const ses = ArtClass.session;
  ArtClass.join(seat);
  ses.prompts[seat] = ses.prompts[seat] || [];
  const results = [];
  let lastWord = null;
  for (let i = 0; i < n; i++) {
    const word = i % 2 === 1 ? Challenge.pickWord(seat) : null;
    if (word) lastWord = word;
    ArtClass.setPrompt(seat, i, n, word);
    await ArtClass.waitDone(seat);
    if (!ArtClass.session) break;
    const ember = PUZZLES['paint-the-word'].reward[0];
    dispatch('hero.ember', seat, { amount: ember });
    ClassRange.light(seat, i, true);
    results.push({ tries: 0, firstTry: true, ember });
    await sleepMs(TEST_MODE ? 5 : 300);
  }
  ses.prompts[seat].subject = lastWord;
  ses.finished = (ses.finished || 0) + 1;
  const el = ArtClass.el.querySelector(`.prompt[data-seat="${seat}"]`);
  if (el) el.textContent = ART_UI.waiting;
  // the last painter to finish saves the shared painting for everyone and closes the easel
  if (ses.finished >= ses.seats.length) {
    const img = ArtClass.snapshot();
    for (const s of ses.seats) dispatch('hero.painting', s, { day: S.shared.clock.day, subject: ses.prompts[s].subject || null, img });
    uiToast(ART_UI.saved, { icon: 'tab-badges' });
    Speech.say(ART_UI.saved, { interrupt: false });
    await sleepMs(TEST_MODE ? 5 : 900);
    ArtClass.close();
  } else {
    await new Promise(resolve => { const tick = () => { if (!ArtClass.session || ArtClass.session !== ses) resolve(); else setTimeout(tick, TEST_MODE ? 5 : 100); }; tick(); });
  }
  return results;
}
addEventListener('DOMContentLoaded', () => { if (typeof CLASS_RUNNERS !== 'undefined') CLASS_RUNNERS.art = artClass; ArtClass.init(); });

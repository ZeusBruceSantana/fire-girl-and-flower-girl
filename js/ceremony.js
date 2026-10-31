'use strict';
/* Ember Bloom: the four ceremonies (Phase C). The moments a child should feel: a class ends, a trouble cheers up,
   a princess levels up, the day ends. One HTML panel each in #ceremony (made here, styles-ceremony.css), above
   everything but the title and the grown-up corner. Each returns a promise that resolves when a child taps the one
   button. Rewards are dispatched by the caller BEFORE the ceremony: a ceremony only shows what already happened,
   so closing it early (or a test) never loses anything.

     await Ceremony.classEnd({ subject: 'spells', teacher, line, rows: [{ seat, stars, coins, xp, found, levelFrom, levelTo }] })
     await Ceremony.battleWin({ trouble: 'Grumpy Weed', rows: [{ seat, xp, coins, loot: [itemIds], friend, levelFrom, levelTo, xpFrom, xpTo }] })
     await Ceremony.levelUp('left', 4)
     await Ceremony.bedtime({ day, rows: [{ seat, stars, words, coins, hearts }], tomorrow: ['myths', 'art'] })

   Under ?test a ceremony closes itself after a moment so the older flow tests keep running; a test that wants to
   look at one sets Ceremony.hold = true and taps the button. */

const CEREMONY_UI = {
  goOn: 'Go on',
  goodnight: 'Goodnight',
  classTitle: '{subject} class',
  coins: '{n} coins',
  xp: '{n} xp',
  found: 'Found {item}',
  battleTitle: 'The {name} cheered up',
  friend: 'The {name} is your friend now',
  levelTitle: 'Level {level}',
  levelLine: '{name} is level {level}.',
  newSpell: 'New spell: {spell}',
  biggerMeter: 'Her ember meter grows.',
  bedTitle: 'Day {day} is done',
  stars: 'stars', words: 'words', coinsWord: 'coins', hearts: 'hearts',
  tomorrow: 'Tomorrow: {a} and {b}',
  sleepWell: 'Sleep well.',
};

const Ceremony = {
  el: null, active: null, hold: false, _done: null,

  root() {
    if (this.el && this.el.isConnected) return this.el;
    this.el = document.getElementById('ceremony');
    if (!this.el) { this.el = document.createElement('div'); this.el.id = 'ceremony'; document.body.appendChild(this.el); }
    return this.el;
  },
  heroName(seat) { const h = S.heroes[seat]; return h.name || WORLD.heroes[h.kind].title; },
  portrait(seat) { return `<div class="cer-face">${Dialogue.portraitHtml(null, seat)}</div>`; },

  /* Show one panel; resolve when its button is tapped. Only one ceremony at a time: a new one closes the old. */
  show(kind, inner, { headline, button = CEREMONY_UI.goOn, variant = 'primary', seat = null } = {}) {
    this.close();
    const el = this.root();
    el.className = 'show cer-' + kind + (seat ? ' seat-' + seat : '');
    el.innerHTML = `<div class="cer-panel" role="dialog" aria-label="${esc(headline || kind)}">
        ${headline ? `<h2 class="cer-title">${esc(headline)}</h2>` : ''}
        <div class="cer-body">${inner}</div>
        <div class="cer-foot"><div class="btn ${variant} cer-go" data-go><span class="word">${esc(button)}</span></div></div>
      </div>`;
    this.active = kind;
    pushLayer('ceremony');
    if (headline) Speech.say(headline);
    return new Promise(resolve => {
      this._done = resolve;
      el.querySelector('[data-go]').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(button); this.close(); });
      // xp bars and other fills start from their "before" width and grow to the "after" one
      requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll('[data-to]').forEach(b => { b.style.width = b.dataset.to + '%'; })));
      if (TEST_MODE && !this.hold) setTimeout(() => { if (this.active === kind && this._done === resolve) this.close(); }, 40);
    });
  },
  close() {
    if (!this.active) return;
    this.active = null;
    if (this.el) { this.el.className = ''; this.el.innerHTML = ''; }
    popLayer('ceremony');
    const r = this._done; this._done = null;
    if (r) r(true);
  },

  /* ---------- pieces ---------- */
  starsHtml(n, seatIndex = 0) {
    return `<div class="cer-stars" data-stars="${n}">${[0, 1, 2].map(i => `<span class="cer-star ${i < n ? 'on' : ''}" style="--i:${seatIndex * 3 + i}">${CER_STAR_SVG}</span>`).join('')}</div>`;
  },
  gainHtml(icon, text, cls = '') { return `<div class="cer-gain ${cls}"><span class="icon">${ART[icon] || ''}</span><span>${esc(text)}</span></div>`; },
  levelCardHtml(seat, level) {
    const h = S.heroes[seat], spells = WORLD.heroes[h.kind].spells.filter(sp => sp.level === level);
    const grows = levelPerk(level, 'maxEmber') > levelPerk(level - 1, 'maxEmber');   // levels 9 and 10 (data/world.js levelPerks)
    return `<div class="cer-level seat-${seat}" data-level="${level}">
        <div class="cer-medal"><span class="small">${esc(CEREMONY_UI.levelTitle.replace(' {level}', ''))}</span><b>${level}</b></div>
        <div class="cer-level-lines"><div class="line">${esc(CEREMONY_UI.levelLine.replace('{name}', this.heroName(seat)).replace('{level}', level))}</div>
          ${spells.map(sp => `<div class="line cer-spell">${ART.ember}<span>${esc(CEREMONY_UI.newSpell.replace('{spell}', sp.word))}</span></div>`).join('')}
          ${grows ? `<div class="line">${esc(CEREMONY_UI.biggerMeter)}</div>` : ''}</div>
      </div>`;
  },
  levelCards(row) {
    if (!(row.levelTo > row.levelFrom)) return '';
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('levelUp');
    let out = '';
    for (let l = row.levelFrom + 1; l <= row.levelTo; l++) out += this.levelCardHtml(row.seat, l);
    return out;
  },
  column(row, inner) {
    return `<div class="cer-col seat-${row.seat}" data-seat="${row.seat}"><div class="cer-who">${this.portrait(row.seat)}<div class="cer-name">${esc(this.heroName(row.seat))}</div></div>${inner}</div>`;
  },

  /* ---------- 1. class end: stars one by one, per girl, and what she earned ---------- */
  classEnd({ subject, teacher, line, rows }) {
    const word = (SCHOOL.subjects[subject] || { word: subject }).word;
    const cols = rows.map((r, i) => this.column(r, this.starsHtml(r.stars, i)
      + `<div class="cer-gains">${this.gainHtml('coin', '+' + CEREMONY_UI.coins.replace('{n}', r.coins))}${r.xp ? this.gainHtml('badge', '+' + CEREMONY_UI.xp.replace('{n}', r.xp)) : ''}${r.found ? this.gainHtml(this.itemArtKey(r.found), CEREMONY_UI.found.replace('{item}', this.itemWord(r.found)), 'found') : ''}</div>`
      + this.levelCards(r))).join('');
    const quote = line ? `<div class="cer-quote">${teacher ? `<span class="who">${esc(teacher)}</span>` : ''}<span class="say">${esc(line)}</span></div>` : '';
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('coin');
    return this.show('class', `<div class="cer-cols n${rows.length}">${cols}</div>${quote}`, { headline: CEREMONY_UI.classTitle.replace('{subject}', word) });
  },

  /* ---------- 2. battle win: the xp bar fills, the loot, a level card if she levelled ---------- */
  battleWin({ trouble, rows }) {
    const cols = rows.map(r => this.column(r,
      `<div class="cer-xp"><div class="bar"><div class="in" style="width:${cerPct(r.xpFrom)}%" data-to="${cerPct(r.xpTo)}"></div></div><b>+${esc(CEREMONY_UI.xp.replace('{n}', r.xp))}</b></div>`
      + `<div class="cer-gains">${this.gainHtml('coin', '+' + CEREMONY_UI.coins.replace('{n}', r.coins))}${(r.loot || []).map(id => this.gainHtml(this.itemArtKey(id), CEREMONY_UI.found.replace('{item}', this.itemWord(id)), 'found loot')).join('')}</div>`
      + (r.friend ? `<div class="cer-friend">${ART.heart}<span>${esc(CEREMONY_UI.friend.replace('{name}', trouble))}</span></div>` : '')
      + this.levelCards(r))).join('');
    return this.show('battle', `<div class="cer-cols n${rows.length}">${cols}</div>`, { headline: CEREMONY_UI.battleTitle.replace('{name}', trouble) });
  },

  /* ---------- 3. level-up, on its own ---------- */
  levelUp(seat, level) {
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('levelUp');
    return this.show('level', `<div class="cer-cols n1">${this.column({ seat }, this.levelCardHtml(seat, level))}</div>`,
      { headline: CEREMONY_UI.levelTitle.replace('{level}', level), seat });
  },

  /* ---------- 4. bedtime: the day's numbers and what tomorrow brings ---------- */
  bedtime({ day, rows, tomorrow }) {
    const cols = rows.map(r => this.column(r, `<div class="cer-numbers">
        ${[['badge', r.stars, CEREMONY_UI.stars], ['ear', r.words, CEREMONY_UI.words], ['coin', r.coins, CEREMONY_UI.coinsWord], ['heart', r.hearts, CEREMONY_UI.hearts]]
          .map(([icon, n, w]) => `<div class="cer-num"><span class="icon">${ART[icon] || ''}</span><b>${n}</b><small>${esc(w)}</small></div>`).join('')}
      </div>`)).join('');
    const words = (tomorrow || []).map(s => (SCHOOL.subjects[s] || { word: s }).word);
    const next = words.length >= 2 ? `<div class="cer-tomorrow" data-tomorrow="${esc(tomorrow.join(','))}">${esc(CEREMONY_UI.tomorrow.replace('{a}', words[0]).replace('{b}', words[1]))}</div>` : '';
    return this.show('bedtime', `<div class="cer-cols n${rows.length}">${cols}</div>${next}<div class="cer-quote"><span class="say">${esc(CEREMONY_UI.sleepWell)}</span></div>`,
      { headline: CEREMONY_UI.bedTitle.replace('{day}', day), button: CEREMONY_UI.goodnight, variant: 'confirm' });
  },

  itemWord(id) { const it = ITEMS.find(i => i.id === id); return it ? it.word : id; },
  itemArtKey(id) { const it = ITEMS.find(i => i.id === id); return it ? itemToastIcon(it) : 'gem'; },   // the item's category icon (data/icons.js via js/bag.js)
};
const cerPct = f => Math.round(100 * clamp(f || 0, 0, 1));
const CER_STAR_SVG = '<svg viewBox="0 0 100 100"><path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" stroke-linejoin="round"/></svg>';

'use strict';
/* Ember Bloom: the girls' own till in the Lair (Phase D, "numbers as play"; docs/review/08 verb 5).
   A Lair station like the lantern or the bookshelf: Lair.open(seat, 'till') draws its frame and calls Till.render.
   Customers from town (data/puzzles.js TILL) bring a picture order and pay with one coin. One girl adds up the order
   (a coin-stack card), the other gives the change (the stack-beside-stack card); with one girl she does both, and two
   girls swap jobs for each customer. Each girl at the till earns a coin per customer; the last customer of the day
   leaves a heart too. TILL.perDay customers, then the till closes until tomorrow (no grinding).
   Losing is soft: the math cards always end in success, and nothing is ever taken away. */

const TILL_UI = {
  title: 'The Till',
  intro: 'Customers are waiting outside. Shall we open the till?',
  open: 'Open the till',
  served: '{n} of {total} served today',
  hello: '{name} would like {things}.',
  pays: '{name} pays with {paid}.',
  addUp: '{who}, how much is it all? Tap the number.',
  change: '{who}: it costs {price}. {name} paid {paid}. Give back the change.',
  thanks: 'Thank you, shopkeepers! Here is a coin each.',
  thanksHeart: 'Thank you! You were my favourite shop today. A coin and a heart each.',
  closed: 'The till is closed for today. More customers come tomorrow.',
  and: 'and',
};

const Till = {
  running: false,
  day() { return S.shared.clock.day; },
  key() { return 'till-' + this.day(); },
  /* The girls at the till: everyone playing on this device (the one who opened it first). */
  seatsFor(seat) { const here = S.settings.localSeats.filter(isPlayerHere); return [seat, ...here.filter(s => s !== seat)]; },
  servedToday(seats) { return Math.max(0, ...seats.map(s => S.heroes[s].stars[this.key()] || 0)); },
  /* The easier of the girls' math bands, so the shared order suits both. */
  band(seats) { return Math.min(...seats.map(s => S.settings.mathLevel[s] || bandForLevel(S.heroes[s].level))); },

  /* A customer: who, what they want (one or two things with prices) and the coin they pay with (more than the order). */
  customer(band, n) {
    const b = TILL.bands[band] || TILL.bands[1];
    const who = TILL.customers[(this.day() * 7 + n * 3) % TILL.customers.length];
    const items = Array.from({ length: b.items }, () => { const g = TILL.goods[Math.floor(Math.random() * TILL.goods.length)]; return { art: g.art, word: g.word, price: 1 + Math.floor(Math.random() * b.priceMax) }; });
    const total = items.reduce((t, it) => t + it.price, 0);
    const paid = [...b.pays].sort((x, y) => x - y).find(p => p > total) || total + 10;
    return { who, person: WORLD.people[who] || { name: who, art: who }, items, total, paid };
  },
  heroName(seat) { const h = S.heroes[seat]; return h.name || WORLD.heroes[h.kind].title; },

  render(body, seat) {
    const seats = this.seatsFor(seat), served = this.servedToday(seats), total = TILL.perDay;
    const dots = Array.from({ length: total }, (_, i) => `<span class="till-dot ${i < served ? 'done' : ''}"></span>`).join('');
    const queue = Array.from({ length: Math.max(0, total - served - 1) }, (_, i) => { const p = WORLD.people[TILL.customers[(this.day() * 7 + (served + 1 + i) * 3) % TILL.customers.length]]; return `<div class="till-wait">${Dialogue.portraitHtml(p && p.art)}</div>`; }).join('');
    const closed = served >= total;
    body.innerHTML = `<div class="till ${closed ? 'closed' : ''}" data-seats="${seats.join(',')}">
      <div class="till-counter">
        <div class="till-customer"><div class="till-face">${closed ? '' : Dialogue.portraitHtml((WORLD.people[TILL.customers[(this.day() * 7 + served * 3) % TILL.customers.length]] || {}).art)}</div><div class="till-say ornate">${esc(closed ? TILL_UI.closed : TILL_UI.intro)}</div></div>
        <div class="till-order"></div>
      </div>
      <div class="till-foot">
        <div class="till-queue">${queue}</div>
        <div class="till-served"><div class="till-dots">${dots}</div><span>${esc(TILL_UI.served.replace('{n}', served).replace('{total}', total))}</span></div>
        ${closed ? '' : `<div class="btn primary till-open" data-serve><span class="icon">${ART.coin}</span><span class="word">${esc(TILL_UI.open)}</span></div>`}
      </div></div>`;
    Speech.say(closed ? TILL_UI.closed : TILL_UI.intro, { interrupt: false });
    const open = body.querySelector('[data-serve]');
    if (open) open.addEventListener('pointerdown', e => { e.stopPropagation(); open.remove(); this.serve(body, seats); });
  },

  /* Serve the customers left today, one after another, until the till closes or the Lair panel does. */
  async serve(body, seats) {
    if (this.running) return;
    this.running = true;
    try {
      const band = this.band(seats);
      let n = this.servedToday(seats), turn = 0;
      while (n < TILL.perDay && Lair.station === 'till' && body.isConnected) {
        const c = this.customer(band, n);
        const counter = seats[turn % seats.length], changer = seats[(turn + 1) % seats.length];
        const things = c.items.map(it => it.word).join(' ' + TILL_UI.and + ' ');
        this.show(body, c, TILL_UI.hello.replace('{name}', c.person.name).replace('{things}', things));
        await sleepMs(TEST_MODE ? 5 : 900);
        const r1 = await MathChallenge.run({ seat: counter, type: 'order-total', band, setup: { items: c.items },
          prompt: TILL_UI.addUp.replace('{who}', this.heroName(counter)) });
        if (!r1 || Lair.station !== 'till') break;
        this.show(body, c, TILL_UI.pays.replace('{name}', c.person.name).replace('{paid}', c.paid), true);
        const r2 = await MathChallenge.run({ seat: changer, type: 'make-change', band, setup: { price: c.total, paid: c.paid, item: c.items[0].art },
          prompt: TILL_UI.change.replace('{who}', this.heroName(changer)).replace('{price}', c.total).replace('{name}', c.person.name).replace('{paid}', c.paid) });
        if (!r2) break;
        n++; turn++;
        const last = n >= TILL.perDay;
        for (const s of seats) {
          dispatch('hero.coins', s, { amount: TILL.coins });
          dispatch('hero.stars', s, { key: this.key(), stars: n });
          if (last && TILL.lastCustomerHearts) dispatch('hero.hearts', s, { amount: TILL.lastCustomerHearts });
        }
        uiToast('+' + TILL.coins, { icon: 'coin' });
        if (last && TILL.lastCustomerHearts) uiToast('+' + TILL.lastCustomerHearts, { icon: 'heart' });
        if (Lair.station !== 'till' || !body.isConnected) break;
        this.show(body, c, last ? TILL_UI.thanksHeart : TILL_UI.thanks);
        this.drawServed(body, n);
        await sleepMs(TEST_MODE ? 5 : 1400);
      }
      if (Lair.station === 'till' && body.isConnected) this.render(body, seats[0]);
    } finally { this.running = false; }
  },
  show(body, c, line, paying = false) {
    const face = body.querySelector('.till-face'), say = body.querySelector('.till-say'), order = body.querySelector('.till-order');
    if (!face) return;
    face.innerHTML = Dialogue.portraitHtml(c.person.art);
    say.textContent = c.person.name + ': ' + line;
    order.innerHTML = c.items.map(it => `<div class="till-thing">${MATH_ART[it.art] || ''}</div>`).join('') + (paying ? `<div class="till-paid">${coinStackHtml(c.paid, { cls: 'paid' })}</div>` : '');
    if (paying) setCoinUnit(order, c.paid, 14);
    Speech.say(line, { interrupt: false });
  },
  drawServed(body, n) {
    body.querySelectorAll('.till-dot').forEach((d, i) => d.classList.toggle('done', i < n));
    const label = body.querySelector('.till-served span'); if (label) label.textContent = TILL_UI.served.replace('{n}', n).replace('{total}', TILL.perDay);
    const q = body.querySelector('.till-queue'); if (q && q.firstElementChild) q.firstElementChild.remove();
  },
};

/* The till's spot in the Lair (data/scenes.js, action 'till') opens its station. day.js sends the other Lair spots
   to Lair.open by name; this adds the till to that list without touching day.js. */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Day === 'undefined' || !Day.onThing || Day.onThing.till) return;
  const base = Day.onThing;
  Day.onThing = function (seat, hotspot) { return hotspot && hotspot.action === 'till' ? Lair.open(seat, 'till') : base.call(this, seat, hotspot); };
  Day.onThing.till = true;
});

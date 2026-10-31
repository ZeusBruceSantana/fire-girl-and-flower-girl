'use strict';
/* Ember Bloom: shops (Epic 4). A keeper, a Buy tab and a Sell tab, big item cards, the hero's coins in the corner.

     await Shop.open('left', 'bakery');     // resolves when the shop is closed

   Rules: she can only buy what she can afford (the card greys out and the keeper says something kind);
   gear for another princess can still be bought as a gift; the market buys duplicates and collectibles at
   the item's sell price; treats are eaten on the spot and refill ember. When a grown-up has set a math
   level (or the hero is level 2+), paying is a quick "make change" moment: exact change on the first try
   earns a bonus coin. Nothing here is ever lost. */

const SHOP_UI = {
  buy: 'Buy', sell: 'Sell', close: 'Close', coins: 'coins',
  bought: 'Yours!', sold: 'Sold!', nothingToSell: 'Nothing to sell yet. Two of a kind, or a treasure, and I will buy it.',
  forHer: 'for {name}', gift: 'A gift for {name}. How kind!',
  eat: 'Yum! Ember +{n}.', eatFull: 'Yum! Ember full to the top.', payPrompt: 'Pay for the {item}. Give back the change.',
  exactChange: 'Exact change! Here is a coin for being quick.',
  sellFor: 'sells for', already: 'You have one', shopWord: 'Shop',
};

const Shop = {
  el: null, seat: null, shop: null, tab: 'buy', resolve: null, busy: false,
  init() { this.el = this.el || $('#shop'); },
  open(seat, shopId) {
    this.init();
    const shop = SHOPS[shopId];
    if (!shop) return Promise.resolve(null);
    this.seat = seat; this.shop = shop; this.tab = 'buy'; this.busy = false;
    pushLayer('shop');
    this.el.className = 'show seat-' + seat;
    this.render();
    Speech.say(shop.greeting);
    return new Promise(resolve => { this.resolve = resolve; });
  },
  close() {
    this.el.className = ''; this.el.innerHTML = '';
    popLayer('shop');
    const r = this.resolve; this.resolve = null; this.seat = null; this.shop = null;
    if (r) r(true);
  },
  hero() { return S.heroes[this.seat]; },
  heroName(seat) { const h = S.heroes[seat]; return h.name || (h.kind ? WORLD.heroes[h.kind].title : ''); },

  render() {
    const shop = this.shop, h = this.hero(), who = WORLD.people[shop.keeper];
    this.el.innerHTML = `<div class="shop-frame">
      <div class="shop-top">
        <div class="shop-portrait">${Dialogue.portraitHtml(shop.art)}</div>
        <div class="shop-greet"><div class="plate"><span>${esc(who.name)}</span></div><div class="shop-say">${esc(shop.greeting)}</div></div>
        <div class="shop-coins">${ART.coin}<b data-coins>${h.coins}</b></div>
      </div>
      <div class="shop-tabs">
        <div class="shop-tab ${this.tab === 'buy' ? 'on' : ''}" data-tab="buy"><span class="icon">${ART['tab-bag']}</span><span class="word">${esc(SHOP_UI.buy)}</span></div>
        ${shop.buys ? `<div class="shop-tab ${this.tab === 'sell' ? 'on' : ''}" data-tab="sell"><span class="icon">${ART.coin}</span><span class="word">${esc(SHOP_UI.sell)}</span></div>` : ''}
      </div>${uiCloseHtml(SHOP_UI.close)}
      <div class="shop-page"></div></div>`;
    this.el.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('pointerdown', e => { e.stopPropagation(); this.tab = t.dataset.tab; this.render(); Speech.say(SHOP_UI[this.tab]); }));
    this.el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); this.close(); });
    const page = this.el.querySelector('.shop-page');
    if (this.tab === 'buy') this.renderBuy(page); else this.renderSell(page);
  },

  /* ---------- buying ---------- */
  renderBuy(page) {
    const h = this.hero(), shop = this.shop;
    const cards = [];
    for (const t of shop.treats || []) {
      const can = h.coins >= t.price;
      cards.push(`<div class="shop-card treat ${can ? '' : 'poor'}" data-treat="${t.id}">
        <div class="art">${ART.ember}</div><div class="word">${esc(t.word)}</div>
        <div class="price">${ART.coin}<b>${t.price}</b></div><div class="note">${esc(t.full ? SHOP_UI.eatFull : SHOP_UI.eat.replace('{n}', t.ember))}</div></div>`);
    }
    for (const id of shop.sells) {
      const item = ITEMS.find(i => i.id === id);
      if (!item || item.price == null) continue;
      const can = h.coins >= item.price;
      const forOther = item.for !== 'any' && item.for !== h.kind;
      const owned = h.inventory.includes(id);
      cards.push(`<div class="shop-card rarity-${item.rarity} ${can ? '' : 'poor'}" data-item="${id}">
        <div class="art">${ART[item.art] || ART.gem}</div><div class="word">${esc(item.word)}</div>
        <div class="price">${ART.coin}<b>${item.price}</b></div>
        ${forOther ? `<div class="note gift">${esc(SHOP_UI.forHer.replace('{name}', WORLD.heroes[item.for].title))}</div>` : ''}
        ${owned ? `<div class="note">${esc(SHOP_UI.already)}</div>` : ''}</div>`);
    }
    page.innerHTML = `<div class="shop-grid">${cards.join('')}</div>`;
    page.querySelectorAll('[data-treat]').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); this.buyTreat(el.dataset.treat); }));
    page.querySelectorAll('[data-item]').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); this.buy(el.dataset.item); }));
  },
  async buy(itemId) {
    if (this.busy) return;
    const item = ITEMS.find(i => i.id === itemId), h = this.hero(), seat = this.seat, shop = this.shop;
    if (!item) return;
    Speech.say(item.word + '. ' + item.about, { interrupt: true });
    if (h.coins < item.price) { await this.keeperSays(shop.cantAfford); return; }
    this.busy = true;
    const bonus = await this.payMoment(item.word);
    if (!this.shop) return;                              // closed meanwhile
    dispatch('hero.coins', seat, { amount: -item.price });
    dispatch('hero.item', seat, { item: item.id });
    if (bonus) { dispatch('hero.coins', seat, { amount: 1 }); uiToast(SHOP_UI.exactChange, { icon: 'coin' }); Speech.say(SHOP_UI.exactChange, { interrupt: false }); }
    const forOther = item.for !== 'any' && item.for !== h.kind;
    uiToast(SHOP_UI.bought + ' ' + item.word, { icon: 'gem' });
    Speech.say(forOther ? SHOP_UI.gift.replace('{name}', WORLD.heroes[item.for].title) : SHOP_UI.bought, { interrupt: false });
    dispatch('event.add', seat, { what: 'bought', item: item.id, shop: shop.id });
    this.busy = false;
    this.render();
  },
  async buyTreat(treatId) {
    if (this.busy) return;
    const t = (this.shop.treats || []).find(x => x.id === treatId), h = this.hero(), seat = this.seat;
    if (!t) return;
    if (h.coins < t.price) { await this.keeperSays(this.shop.cantAfford); return; }
    this.busy = true;
    const bonus = await this.payMoment(t.word);
    if (!this.shop) return;
    dispatch('hero.coins', seat, { amount: -t.price });
    const gain = t.full ? S.heroes[seat].maxEmber : Math.min(t.ember, S.heroes[seat].maxEmber - S.heroes[seat].ember);   // a full treat fills the meter; the toast says what was really gained
    dispatch('hero.ember', seat, { amount: t.full ? S.heroes[seat].maxEmber : t.ember });
    if (bonus) { dispatch('hero.coins', seat, { amount: 1 }); uiToast(SHOP_UI.exactChange, { icon: 'coin' }); }
    uiToast(SHOP_UI.eat.replace('{n}', gain), { icon: 'ember' });
    Speech.say(SHOP_UI.eat.replace('{n}', gain), { interrupt: false });
    if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('hop');
    this.busy = false;
    this.render();
  },
  /* The math moment: make change at the counter. Returns true for a first-try exact answer (a bonus coin). */
  async payMoment(itemWord) {
    const seat = this.seat, h = this.hero();
    const level = S.settings.mathLevel[seat] || 0;
    if (typeof MathChallenge === 'undefined' || !MathChallenge.run) return false;
    if (!level && h.level < 2) return false;
    const band = level || 1;
    const r = await MathChallenge.run({ seat, type: 'make-change', band, prompt: SHOP_UI.payPrompt.replace('{item}', itemWord) });
    return !!(r && r.firstTry);
  },
  keeperSays(text) {
    const who = WORLD.people[this.shop.keeper];
    const say = this.el.querySelector('.shop-say');
    if (say) { say.textContent = text; say.classList.add('kind'); setTimeout(() => say.classList.remove('kind'), TEST_MODE ? 10 : 1500); }
    Speech.say(text);
    void who;
    return sleepMs(TEST_MODE ? 5 : 400);
  },

  /* ---------- selling ---------- */
  sellable() {
    const h = this.hero(), counts = {};
    for (const id of h.inventory) counts[id] = (counts[id] || 0) + 1;
    return Object.entries(counts).map(([id, n]) => ({ item: ITEMS.find(i => i.id === id), n })).filter(x => x.item && x.item.sell != null && (x.n > 1 || x.item.slot === null));
  },
  renderSell(page) {
    const list = this.sellable();
    if (!list.length) { page.innerHTML = `<div class="shop-empty">${esc(SHOP_UI.nothingToSell)}</div>`; return; }
    page.innerHTML = `<div class="shop-grid">${list.map(({ item, n }) => `<div class="shop-card rarity-${item.rarity}" data-sell="${item.id}">
      <div class="art">${ART[item.art] || ART.gem}</div><div class="word">${esc(item.word)}</div>
      <div class="price">${esc(SHOP_UI.sellFor)} ${ART.coin}<b>${item.sell}</b></div>${n > 1 ? `<div class="n">×${n}</div>` : ''}</div>`).join('')}</div>`;
    page.querySelectorAll('[data-sell]').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); this.sell(el.dataset.sell); }));
  },
  sell(itemId) {
    if (this.busy) return;
    const item = ITEMS.find(i => i.id === itemId), seat = this.seat;
    if (!item || !this.hero().inventory.includes(itemId)) return;
    dispatch('hero.sell', seat, { item: itemId, coins: item.sell });
    dispatch('event.add', seat, { what: 'sold', item: itemId, shop: this.shop.id });
    uiToast(SHOP_UI.sold + ' +' + item.sell, { icon: 'coin' });
    Speech.say(SHOP_UI.sold);
    this.render();
  },
};

'use strict';
/* SHOPS in Middlemarket. Each shop has a keeper (WORLD.people id), what it sells (item ids from data/items.js),
   whether it buys duplicates, and optional treats (not items: eaten on the spot, they give ember).

   Fields:
     id, word       the shop's name
     keeper, art    who runs it (WORLD.people id) and her picture id
     greeting       what she says when you walk in
     cantAfford     her kind line when coins are short (never a sad no)
     sells          item ids on the shelves (prices come from data/items.js)
     treats         [{ id, word, price, ember, full? }]  snacks that refill the Ember meter (full: true fills it to the top)
     buys           true = she buys duplicates and collectibles at the item's sell price */

const SHOPS = {
  bakery: {
    id: 'bakery', word: 'the bakery', keeper: 'baker', art: 'baker',
    greeting: 'Welcome, dears! Warm rolls, and a few odds and ends from the attic.',
    cantAfford: 'Not quite enough coins, love. Come back after an adventure, I will keep it warm.',
    sells: ['seed-sun', 'crown-paper', 'wand-twig', 'cape-wool', 'boots-mud'],
    treats: [{ id: 'warm-roll', word: 'warm roll', price: 2, ember: 4 }, { id: 'lantern-pie', word: 'lantern pie', price: 6, ember: 10, full: true }],
    buys: false,
  },
  market: {
    id: 'market', word: 'the market', keeper: 'goatherd', art: 'goatherd',
    greeting: 'Hello! Gear for adventurers, and I buy anything you have two of. Mind the goats.',
    cantAfford: 'A few more coins and it is yours. Sell me something? The goats ate my purse.',
    sells: ['wand-candle', 'wand-rose', 'crown-ember', 'crown-daisy', 'cape-ember', 'cape-petal', 'boots-spark', 'seed-sun'],
    treats: [],
    buys: true,
  },
};

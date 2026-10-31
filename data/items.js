'use strict';
/* ITEMS AND RARITY.
   Rarity must be obvious without reading: each tier has its own color, glow, sound and a different
   "found it" moment. Duplicates are never wasted: they sell for the item's "sell" price.

   Fields:
     id      short unique name, used in saves (never rename an id once the girls have one; add a new item instead)
     word    the word a player sees and can tap to hear
     rarity  'common' | 'rare' | 'legendary'
     slot    where it goes when worn: 'hand' | 'head' | 'back' | 'feet' | null (a collectible, not worn)
     for     'fire' | 'flower' | 'any'  (who can wear it; anyone can collect it)
     price   what the shop charges (coins). null = not sold, only found.
     sell    what a duplicate sells for (coins)
     art     picture id (placeholder SVG until real art arrives)
     about   one short line, read aloud on tap
     effect  (gear only) what wearing it does, summed across everything worn (see js/bag.js gearEffects):
               maxEmber: +N to the Ember meter's size   hearts: +N hearts at lunch and when helping
               reveal: 1 shows hidden sparkles on maps   freeSpark: 1 free level-1 spell each day
     Materials (slot null, from classes and adventures) are crafted at the Lair: see data/crafting.js */

const RARITY = {
  common:    { word: 'common',    color: '#9aa3ad', glow: 'none',                 sound: 'found-1', weight: 70, stars: 1 },
  rare:      { word: 'rare',      color: '#4a9be0', glow: '0 0 3vmin #7fc4ff',    sound: 'found-2', weight: 25, stars: 2 },
  legendary: { word: 'legendary', color: '#f0b429', glow: '0 0 6vmin #ffd23f',    sound: 'found-3', weight: 5,  stars: 3 },
};

const ITEMS = [
  // ---- hands (wands) ----
  { id: 'wand-twig',     word: 'twig wand',     rarity: 'common',    slot: 'hand', for: 'any',    price: 5,    sell: 1,  art: 'wand',   about: 'A good first wand. A bit bendy.' },
  { id: 'wand-candle',   word: 'candle wand',   rarity: 'rare',      slot: 'hand', for: 'fire',   price: 30,   sell: 6,  art: 'wand',   effect: { maxEmber: 2 }, about: 'Never goes out, even in rain.' },
  { id: 'wand-rose',     word: 'rose wand',     rarity: 'rare',      slot: 'hand', for: 'flower', price: 30,   sell: 6,  art: 'wand',   effect: { hearts: 1 }, about: 'Smells nice. Thorns are only for show.' },
  { id: 'wand-sunstone', word: 'sunstone wand', rarity: 'legendary', slot: 'hand', for: 'any',    price: null, sell: 25, art: 'wand',   effect: { maxEmber: 3, hearts: 1 }, about: 'Warm as a summer morning. Found, never sold.' },

  // ---- heads ----
  { id: 'crown-paper',   word: 'paper crown',   rarity: 'common',    slot: 'head', for: 'any',    price: 3,    sell: 1,  art: 'crown',  about: 'Made in art class.' },
  { id: 'crown-ember',   word: 'ember crown',   rarity: 'rare',      slot: 'head', for: 'fire',   price: 40,   sell: 8,  art: 'crown',  effect: { freeSpark: 1 }, about: 'Glows softly. Do not wear to bed.' },
  { id: 'crown-daisy',   word: 'daisy crown',   rarity: 'rare',      slot: 'head', for: 'flower', price: 40,   sell: 8,  art: 'crown',  effect: { hearts: 1 }, about: 'Fresh every morning.' },
  { id: 'crown-moon',    word: 'moon crown',    rarity: 'legendary', slot: 'head', for: 'any',    price: null, sell: 30, art: 'crown',  effect: { reveal: 1, maxEmber: 1 }, about: 'Only found on the coldest night.' },

  // ---- backs (capes) ----
  { id: 'cape-wool',     word: 'wool cape',     rarity: 'common',    slot: 'back', for: 'any',    price: 8,    sell: 2,  art: 'cape',   about: 'Warm and a little itchy.' },
  { id: 'cape-ember',    word: 'ember cape',    rarity: 'rare',      slot: 'back', for: 'fire',   price: 45,   sell: 9,  art: 'cape',   effect: { freeSpark: 1 }, about: 'Flickers when you run.' },
  { id: 'cape-petal',    word: 'petal cape',    rarity: 'rare',      slot: 'back', for: 'flower', price: 45,   sell: 9,  art: 'cape',   effect: { hearts: 1 }, about: 'Leaves a trail of petals.' },

  // ---- feet ----
  { id: 'boots-mud',     word: 'mud boots',     rarity: 'common',    slot: 'feet', for: 'any',    price: 6,    sell: 1,  art: 'boots', effect: { reveal: 1 },  about: 'For the garden.' },
  { id: 'boots-spark',   word: 'spark boots',   rarity: 'rare',      slot: 'feet', for: 'any',    price: 35,   sell: 7,  art: 'boots', effect: { reveal: 1 },  about: 'Tiny sparks with every step. Safe ones.' },

  // ---- collectibles (not worn) ----
  { id: 'gem-amber',     word: 'amber',         rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 2,  art: 'gem',    about: 'A drop of old tree sap, gone hard and gold.' },
  { id: 'gem-dewdrop',   word: 'dewdrop gem',   rarity: 'rare',      slot: null,   for: 'any',    price: null, sell: 8,  art: 'gem',    about: 'A dewdrop that forgot to dry.' },
  { id: 'gem-ember-bloom', word: 'ember bloom', rarity: 'legendary', slot: null,   for: 'any',    price: null, sell: 40, art: 'gem',    about: 'A flower with a flame inside. Only found together.' },
  { id: 'seed-sun',      word: 'sun seed',      rarity: 'common',    slot: null,   for: 'any',    price: 2,    sell: 1,  art: 'seed',   about: 'Grows a sunflower in a day.' },
  // ---- materials (crafted at the Lair, see data/crafting.js) ----
  { id: 'charcoal',      word: 'charcoal',      rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'A burnt stick. Fire Girl makes ash paint from it.' },
  { id: 'petals',        word: 'petals',        rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'Soft and pink. Flower Girl makes dye from them.' },
  { id: 'spark-dust',    word: 'spark dust',    rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'Tingly. Electric Girl makes glow ink from it.' },
  { id: 'ash-paint',     word: 'ash paint',     rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'Grey and black paint, made from charcoal.' },
  { id: 'petal-dye',     word: 'petal dye',     rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'Pink and green dye, made from petals.' },
  { id: 'glow-ink',      word: 'glow ink',      rarity: 'common',    slot: null,   for: 'any',    price: null, sell: 1,  art: 'gem',    about: 'Ink that glows in the dark, made from spark dust.' },
  { id: 'lantern-paint', word: 'lantern paint', rarity: 'rare',      slot: null,   for: 'any',    price: null, sell: 4,  art: 'gem',    about: 'Paint that holds a little light. Ash and dye together.' },
  { id: 'book-small-magic', word: 'spell book', rarity: 'rare',      slot: null,   for: 'any',    price: null, sell: 10, art: 'book',   about: 'Professor Hoot\'s own copy. Smells of feathers.' },
];

/* Item sets: owning every item in a set shows a small badge in the collection book. */
const ITEM_SETS = {
  ember:  { word: 'Ember set',  items: ['wand-candle', 'crown-ember', 'cape-ember'] },
  petal:  { word: 'Petal set',  items: ['wand-rose', 'crown-daisy', 'cape-petal'] },
  school: { word: 'School set', items: ['wand-twig', 'crown-paper', 'book-small-magic'] },
};

'use strict';
/* CRAFTING (version 3, Epic 4). At the Lair's round table, materials from classes and adventures turn into
   paints, inks and, in the end, something legendary. Recipes are data; js/bag.js shows them and the
   'hero.craft' action in js/state.js does the making.

   Fields:
     id, word   the recipe's name
     needs      item ids used up, one each (see the materials in data/items.js)
     makes      the item id that appears
     who        'fire' | 'flower' | 'electric' | 'any'  (which princess can do it)
     about      one line, read aloud */

const RECIPES = [
  { id: 'ash-paint',     word: 'Ash paint',     needs: ['charcoal'],                   makes: 'ash-paint',       who: 'fire',     about: 'Burn a charcoal stick down and grind the ash. Greys and blacks for painting.' },
  { id: 'petal-dye',     word: 'Petal dye',     needs: ['petals'],                     makes: 'petal-dye',       who: 'flower',   about: 'Crush petals with a little dew. Pinks and greens for painting.' },
  { id: 'glow-ink',      word: 'Glow ink',      needs: ['spark-dust'],                 makes: 'glow-ink',        who: 'electric', about: 'Stir spark dust into water until it hums. Ink that glows.' },
  { id: 'lantern-paint', word: 'Lantern paint', needs: ['ash-paint', 'petal-dye'],     makes: 'lantern-paint',   who: 'any',      about: 'Ash and dye together: paint that holds a little light. Ember-Bloom magic in a jar.' },
  { id: 'ember-bloom',   word: 'Ember bloom',   needs: ['lantern-paint', 'glow-ink'],  makes: 'gem-ember-bloom', who: 'any',      about: 'The legendary one. A flower with a flame inside, and a spark to keep it glowing.' },
];

/* POTIONS (Phase D, "brew the potion"): no materials, just reading. The recipe names two or three of her own words
   (as pictures where the word has one); she finds each one's jar on the shelf by reading the labels. One brew a day.
     words   how many ingredients      color   the cauldron's colour      makes   the item id that appears */
const POTIONS = [
  { id: 'giggle-potion', word: 'Giggle potion', words: 2, color: '#ff8fb8', makes: 'potion-giggle', about: 'Two ingredients. Smells of bubblegum.' },
  { id: 'glow-potion',   word: 'Glow potion',   words: 3, color: '#ffd23f', makes: 'potion-glow',   about: 'Three ingredients. Glows in a dark cupboard.' },
];

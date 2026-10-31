'use strict';
/* PUZZLES: math and logic challenge types. Reading challenges are in data/challenges.js; these follow the
   same rules (tap-based, never punished, a hint ladder, always end in success, reward shrinks a little by tries).

   Fields:
     id, word     name shown to a grown-up
     subject      'numbers' | 'myths' | 'art' | 'logic'
     how          what the player sees and does
     bands        difficulty by the parent's "math level" setting (1, 2, 3). Each band says what numbers appear.
     hints        in order after miss 1, 2, 3
     reward       sparkle size by tries [first, second, third+]  (never 0)
     fits         where it feels natural in quests and cases */

const PUZZLES = {
  // ---------- Numbers (Mr. Abacus) ----------
  'coin-count': {
    word: 'Count the coins', subject: 'numbers',
    how: 'Coins are on the table. Tap the number that says how many (or how much).',
    bands: { 1: { max: 10, coins: [1] }, 2: { max: 20, coins: [1, 5] }, 3: { max: 100, coins: [1, 5, 10, 25] } },
    hints: ['the coins line up in a row', 'Mr. Abacus counts along, one tap at a time', 'the right number glows'],
    reward: [3, 2, 1], fits: ['market', 'chest', 'case clue'],
  },
  'make-change': {
    word: 'Make change', subject: 'numbers',
    how: 'Something costs this much. You pay with this coin. Tap the coins to give back.',
    bands: { 1: { max: 10, coins: [1] }, 2: { max: 20, coins: [1, 5] }, 3: { max: 100, coins: [1, 5, 10, 25] } },
    hints: ['the price and the coin sit side by side', 'count up from the price with Mr. Abacus', 'the right coins glow'],
    reward: [4, 3, 2], fits: ['market', 'ice cream'],
  },
  'number-line': {
    word: 'Number line', subject: 'numbers',
    how: 'A number line with one empty spot. Tap the number that goes there.',
    bands: { 1: { max: 10, step: 1 }, 2: { max: 20, step: 1 }, 3: { max: 100, step: [1, 2, 5, 10] } },
    hints: ['the numbers on each side glow', 'Mr. Abacus counts across', 'the right number glows'],
    reward: [3, 2, 1], fits: ['path', 'ladder', 'case clue'],
  },
  'skip-pattern': {
    word: 'What comes next', subject: 'numbers',
    how: 'A pattern of numbers or pictures. Tap what comes next.',
    bands: { 1: { kind: 'pictures', length: 3 }, 2: { kind: 'numbers', step: [1, 2], max: 20 }, 3: { kind: 'numbers', step: [2, 5, 10], max: 100 } },
    hints: ['the pattern taps itself out loud', 'Mr. Abacus says the rule', 'the right answer glows'],
    reward: [3, 2, 1], fits: ['stepping stones', 'lanterns', 'case clue'],
  },
  'add-sub': {
    word: 'Add and take away', subject: 'numbers',
    how: 'Pictures show a sum (3 apples and 2 apples). Tap the answer.',
    bands: { 1: { max: 10, ops: ['+'] }, 2: { max: 20, ops: ['+', '-'] }, 3: { max: 100, ops: ['+', '-'] } },
    hints: ['the pictures group together', 'Mr. Abacus counts them all', 'the right answer glows'],
    reward: [3, 2, 1], fits: ['baker', 'garden', 'case clue'],
  },
  'more-less': {
    word: 'More or less', subject: 'numbers',
    how: 'Two groups. Tap the one with more (or less, or the same).',
    bands: { 1: { max: 10 }, 2: { max: 20 }, 3: { max: 100 } },
    hints: ['the groups line up to compare', 'Mr. Abacus counts both', 'the right group glows'],
    reward: [2, 2, 1], fits: ['goats', 'market', 'case clue'],
  },

  // ---------- Myths (Professor Hoot) ----------
  'myth-order': {
    word: 'Story order', subject: 'myths',
    how: 'Three pictures from the story. Tap them in the order they happened.',
    bands: { 1: { count: 3 }, 2: { count: 3 }, 3: { count: 4 } },
    hints: ['the first picture glows', 'Hoot retells the story in one line', 'the next right picture glows'],
    reward: [3, 2, 1], fits: ['myths class'],
  },
  'myth-match': {
    word: 'Who did what', subject: 'myths',
    how: 'Three names and three pictures. Tap a name, then its picture.',
    bands: { 1: { pairs: 2 }, 2: { pairs: 3 }, 3: { pairs: 3 } },
    hints: ['the name is read aloud', 'a wrong picture fades', 'the right picture glows'],
    reward: [3, 2, 1], fits: ['myths class'],
  },
  'myth-word': {
    word: 'Fill the gap', subject: 'myths',
    how: 'A sentence from the story with a word missing. Tap the right word.',
    bands: { 1: { choices: 2 }, 2: { choices: 3 }, 3: { choices: 3 } },
    hints: ['the sentence is read aloud with a hum for the gap', 'a wrong word fades', 'the right word glows'],
    reward: [3, 2, 1], fits: ['myths class', 'scroll'],
  },

  // ---------- Art (Miss Palette) ----------
  'paint-free': {
    word: 'Paint together', subject: 'art',
    how: 'A shared canvas. Each hero has her own colors: ash grays and ember oranges, petal pinks and leaf greens, light blues and sparkle whites. Finger painting. Save to the gallery.',
    bands: { 1: {}, 2: {}, 3: {} },
    hints: [], reward: [2, 2, 2], fits: ['art class', 'gift'],
  },
  'paint-the-word': {
    word: 'Paint the word', subject: 'art',
    how: 'Miss Palette shows a word (sun, cat, tree...). Paint it. A grown-up or the hero herself taps done. No wrong answers.',
    bands: { 1: {}, 2: {}, 3: {} },
    hints: ['the word is read aloud', 'a faint outline appears to trace'], reward: [3, 3, 3], fits: ['art class'],
  },

  // ---------- Logic (cases and adventures) ----------
  'odd-one-out': {
    word: 'Odd one out', subject: 'logic',
    how: 'Four pictures. Tap the one that does not belong.',
    bands: { 1: { count: 3 }, 2: { count: 4 }, 3: { count: 4 } },
    hints: ['the group is named aloud', 'a wrong picture fades', 'the right picture glows'],
    reward: [3, 2, 1], fits: ['case clue', 'suspects'],
  },
  'memory-pairs': {
    word: 'Memory pairs', subject: 'logic',
    how: 'Cards face down. Tap two to find a pair.',
    bands: { 1: { pairs: 3 }, 2: { pairs: 4 }, 3: { pairs: 6 } },
    hints: ['the cards peek for a second', 'a matched card stays face up', 'a wiggle shows where the pair is'],
    reward: [3, 2, 1], fits: ['case clue', 'chest'],
  },

  // ---------- The girls' till (js/till.js) ----------
  'order-total': {
    word: 'Add up the order', subject: 'numbers',
    how: 'A customer wants one or two things. Each price is a coin stack. Tap what they cost all together.',
    bands: { 1: { max: 10, items: 1, priceMax: 9 }, 2: { max: 20, items: 2, priceMax: 9 }, 3: { max: 100, items: 2, priceMax: 40 } },
    hints: ['the stacks count themselves', 'Mr. Abacus counts along', 'the right number glows'],
    reward: [3, 2, 1], fits: ['till'],
  },
};

/* Math difficulty by the hero's level when the parent leaves "math level" on automatic. */
const MATH_BANDS_BY_LEVEL = [ [1, 1], [3, 2], [6, 3] ];   // [from level, band]

/* THE GIRLS' TILL in the Lair (js/till.js). A few customers a day bring a picture order and pay with one coin;
   one girl adds up the order, the other gives the change (with one girl, she does both). Coins are stacks whose
   height is their value, as in the Numbers puzzles.
     customers    WORLD.people ids who come to the till
     goods        what they order: a picture (MATH_ART id in js/numbers.js)
     bands        per math band: how many things, the highest price of one, the coin they pay with
     perDay       customers before the till closes for the day (no grinding)
     coins        coins each girl at the till earns per customer served
     lastCustomerHearts   the last customer of the day also gives each girl this many hearts */
const TILL = {
  customers: ['baker', 'gardener', 'lamplighter', 'goatherd', 'signpainter', 'librarian'],
  goods: ['apple', 'pie', 'seedling', 'star'],
  bands: { 1: { items: 1, priceMax: 9, pays: [10] }, 2: { items: 2, priceMax: 9, pays: [20] }, 3: { items: 2, priceMax: 40, pays: [50, 100] } },
  perDay: 3,
  coins: 1,
  lastCustomerHearts: 1,
};

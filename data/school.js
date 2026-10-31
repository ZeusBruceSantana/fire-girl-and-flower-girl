'use strict';
/* THE SCHOOL DAY. A play session is one school day. Two class periods (rotating), lunch, free time, bedtime.
   Everything here is data: change the rotation, the number of challenges, the lunch tables, the flavors. */

const SCHOOL = {
  /* The parts of a day, in order. 'period' parts take their subject from the rotation below. */
  day: [
    { id: 'wake',     word: 'Good morning',  scene: 'dorm',       about: 'Wake up, pick an outfit. The save point.' },
    { id: 'period1',  word: 'First class',   kind: 'period' },
    { id: 'period2',  word: 'Second class',  kind: 'period' },
    { id: 'lunch',    word: 'Lunch',         scene: 'cafeteria',  about: 'Friends, conversations, ice cream.' },
    { id: 'free',     word: 'Free time',     scene: 'library',    about: 'The library... and the secret shelf.' },
    { id: 'bedtime',  word: 'Bedtime',       scene: 'dorm',       about: 'The day summary: stars, badges, what you learned.' },
  ],

  /* Subjects. Each is a class period. "challenges" = which puzzle types the period draws from (see data/challenges.js
     for reading and data/puzzles.js for math and logic). "perClass" = how many challenges in one period, by the
     parent's "class length" setting (short / normal / long). */
  subjects: {
    spells:  { word: 'Spells',  teacher: 'cinder',  scene: 'classroom', icon: 'spells',
               about: 'Cast the day\'s spells by reading your own school words.',
               challenges: ['hear-and-pick', 'picture-match', 'letter-tiles', 'read-to-grown-up'],
               perClass: { short: 3, normal: 4, long: 6 } },
    numbers: { word: 'Numbers', teacher: 'abacus',  scene: 'classroom', icon: 'numbers',
               about: 'Count coins, make change, find the pattern.',
               challenges: ['coin-count', 'make-change', 'number-line', 'skip-pattern', 'add-sub', 'more-less'],
               perClass: { short: 3, normal: 4, long: 6 } },
    myths:   { word: 'Myths',   teacher: 'hoot',    scene: 'classroom', icon: 'myths',
               about: 'Professor Hoot tells a story from long ago. Then three questions.',
               challenges: ['myth-order', 'myth-match', 'myth-word'],
               perClass: { short: 2, normal: 3, long: 3 } },
    art:     { word: 'Art',     teacher: 'palette', scene: 'classroom', icon: 'art',
               about: 'Paint together. Fire makes ash paint, Flower makes petal dye, Electric draws light.',
               challenges: ['paint-free', 'paint-the-word'],
               perClass: { short: 1, normal: 2, long: 2 } },
  },

  /* The rotation: which two subjects happen on which day. Day 1 uses row 0, day 2 row 1, and so on, repeating. */
  rotation: [
    ['spells', 'numbers'],
    ['myths',  'art'],
    ['spells', 'myths'],
    ['numbers', 'art'],
  ],

  /* Lunch. Friends sit at different tables each day (by day number). "friends" are ids in data/friends.js. */
  lunch: {
    tables: 3,
    seatingByDay: [            // which friends are at lunch each day, cycling
      ['ice', 'wind'],
      ['stone', 'cloud'],
      ['shell', 'moss'],
      ['ice', 'cloud'],
      ['wind', 'moss'],
      ['stone', 'shell'],
    ],
    // Ice cream. Flavors unlock by friendship level with the named friend (null = always).
    iceCream: [
      { id: 'vanilla',    word: 'vanilla',       price: 2, unlock: null },
      { id: 'strawberry', word: 'strawberry',    price: 2, unlock: null },
      { id: 'mint',       word: 'mint',          price: 3, unlock: { friend: 'ice',   level: 2 } },
      { id: 'honeycomb',  word: 'honeycomb',     price: 3, unlock: { friend: 'moss',  level: 2 } },
      { id: 'cloudberry', word: 'cloudberry',    price: 4, unlock: { friend: 'cloud', level: 3 } },
      { id: 'ember-swirl', word: 'ember swirl',  price: 5, unlock: { friend: 'stone', level: 4 } },
    ],
  },

  /* Weather by day (cycles). Rain helps Flower, dry days help Fire, storms help Electric: that hero wakes with extra ember. */
  weather: ['sun', 'cloud', 'rain', 'sun', 'storm', 'cloud', 'rain'],
  weatherBoost: { rain: 'flower', sun: 'fire', storm: 'electric' },

  /* Class stars: how many a period gives, by how many first-try answers. */
  stars: { three: 0.8, two: 0.5 },   // 80% first-try = 3 stars, 50% = 2 stars, otherwise 1 (never 0)
};

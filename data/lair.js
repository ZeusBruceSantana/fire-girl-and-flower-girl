'use strict';
/* THE LAIR: the girls' secret headquarters in an old root cellar under the library.
   Upgrades are bought with Friendship Hearts from the shared Lair fund (never with coins, never with power).
   Each upgrade changes the lair scene (an extra "mid" layer piece) and may unlock something.

   Fields:
     id, word     name
     hearts       cost from the shared fund  (the real upgrades)
     coins        OR a price in coins from the tapping hero's own purse (the cozy bits: looks only, no unlock)
     needs        another upgrade id first, or null
     art          the layer piece drawn into the lair scene when owned (art/scenes/lair/upgrade-<art>.svg|png); also its icon
                  in the Lantern's room view (data/icons.js ROOM_ICONS)
     at           where it sits in the Lantern's room view: [x, y] in percent of the Lair picture (move freely)
     unlocks      what it does: 'map' (the world map on the wall), 'gallery', 'cases', 'visits', 'snacks', 'stuffies', 'music', 'telescope'
     effect       (optional) a gear-style effect while owned, summed by lairEffects() in js/lair.js: { reveal: 1 } shows hidden sparkles on every map
     about        one line, read aloud */

const LAIR = {
  upgrades: [
    { id: 'cushions',   word: 'cushions',      hearts: 0,  needs: null,       at: [37, 62], art: 'cushions',   unlocks: null,        about: 'Three cushions, one each. The first thing they brought down.' },
    { id: 'lantern',    word: 'big lantern',   hearts: 3,  needs: null,       at: [24, 18], art: 'lantern',    unlocks: null,        about: 'Fire Girl lights it, Flower Girl holds it, Electric Girl makes it hum. Never goes out.' },
    { id: 'case-board', word: 'case board',    hearts: 4,  needs: 'lantern',  at: [86, 32], art: 'caseboard',  unlocks: 'cases',     about: 'A cork board with string and pins. Where the clues go.' },
    { id: 'map-wall',   word: 'map wall',      hearts: 5,  needs: 'lantern',  at: [38, 31], art: 'map',        unlocks: 'map',       about: 'A map of the woods and the town, drawn by hand. Tap a place to go.' },
    { id: 'gallery',    word: 'gallery wall',  hearts: 5,  needs: null,       at: [28, 35], art: 'gallery',    unlocks: 'gallery',   about: 'Pins for paintings. Art class comes home.' },
    { id: 'snack-corner', word: 'snack corner', hearts: 6, needs: 'cushions', at: [49, 53], art: 'snacks',     unlocks: 'snacks',    about: 'A tin of biscuits and a jug. Friends who visit get a snack.' },
    { id: 'guest-cushion', word: 'guest cushion', hearts: 6, needs: 'snack-corner', at: [46, 80], art: 'guest', unlocks: 'visits',   about: 'A fourth cushion. Now a friend can be invited down.' },
    { id: 'stuffie-bed', word: 'stuffie bed',   hearts: 8,  needs: 'cushions', at: [78, 74], art: 'stuffies',   unlocks: 'stuffies',  about: 'A little bed for a stuffed animal who keeps watch.' },
    { id: 'bookshelf',  word: 'bookshelf',     hearts: 8,  needs: 'lantern',  at: [73, 47], art: 'bookshelf',  unlocks: 'scrolls',   about: 'For the Myth Scrolls. Professor Hoot would approve, if he knew.' },
    { id: 'radio',      word: 'crystal radio', hearts: 10, needs: 'lantern',  at: [85, 55], art: 'radio',      unlocks: 'music',     about: 'Electric Girl built it. Plays one station: the Lair\'s own tune.' },
    { id: 'telescope',  word: 'periscope',     hearts: 12, needs: 'map-wall', at: [55, 6], art: 'periscope',  unlocks: 'telescope', effect: { reveal: 1 }, about: 'Pokes up through a drain in the town square. Spots every hidden sparkle on every map.' },

    // ---- cozy bits: bought with a hero's own coins, looks only (something to save up for once the shops are bought out) ----
    { id: 'bunting',      word: 'bunting',         coins: 10, needs: null, at: [35, 7], art: 'bunting',    unlocks: null, about: 'Little flags on a string. Every day is a party day now.' },
    { id: 'rag-rug',      word: 'rag rug',         coins: 12, needs: null, at: [57, 74], art: 'rug',        unlocks: null, about: 'Made of old socks. Warm toes. Do not ask whose socks.' },
    { id: 'lamp-blue',    word: 'blue lamp shade', coins: 15, needs: null, at: [97, 45], art: 'lamp-blue',  unlocks: null, about: 'The Lair goes the colour of a deep pond. Very calm. Very sleepy.' },
    { id: 'lamp-pink',    word: 'pink lamp shade', coins: 15, needs: null, at: [44, 9], art: 'lamp-pink',  unlocks: null, about: 'The Lair goes the colour of strawberry ice cream. Cook would approve.' },
    { id: 'lamp-gold',    word: 'gold lamp shade', coins: 20, needs: null, at: [65, 27], art: 'lamp-gold',  unlocks: null, about: 'The Lair glows like a bakery window at dawn.' },
    { id: 'window-box',   word: 'window box',      coins: 12, needs: null, at: [72, 15], art: 'windowbox',  unlocks: null, about: 'There is no window. The flowers do not seem to mind.' },
    { id: 'kettle',       word: 'kettle',          coins: 14, needs: null, at: [62, 52], art: 'kettle',     unlocks: null, about: 'Fire Girl warms it. It whistles the school song, slightly wrong.' },
    { id: 'cuckoo-clock', word: 'cuckoo clock',    coins: 18, needs: null, at: [51, 24], art: 'clock',      unlocks: null, about: 'The cuckoo is a tiny owl. It says "Hoo" on the hour.' },
    { id: 'star-ceiling', word: 'star ceiling',    coins: 25, needs: null, at: [88, 6], art: 'stars',      unlocks: null, about: 'Glow ink stars on the ceiling. Electric Girl did the Big Dipper. Twice.' },
    { id: 'doormat',      word: 'doormat',         coins: 10, needs: null, at: [93, 92], art: 'doormat',    unlocks: null, about: 'It says WIPE YOUR PAWS. Nobody knows why paws.' },
    { id: 'wind-chime',   word: 'wind chime',      coins: 16, needs: null, at: [18, 9], art: 'chime',      unlocks: null, about: 'There is no wind down here. It chimes anyway when someone laughs.' },
    { id: 'flower-jar',   word: 'flower jar',      coins: 11, needs: null, at: [54, 44], art: 'flowerjar',  unlocks: null, about: 'One jar, one flower, never wilts. Flower Girl checks on it every day.' },
  ],

  /* The shared Lair fund gets a copy of every Heart a hero earns (hers stay hers; spending never drains the fund). */
  fundShare: 1.0,
};

/* BADGES: pinned to each hero's sash. Earned from cases, class stars, together spells. */
const BADGES = {
  'junior-helper':  { word: 'Junior Helper',  art: 'badge',          about: 'Sworn in by Constable Pebble.' },
  'first-case':     { word: 'First Case',     art: 'badge-pie',      about: 'Solved The Missing Pie.' },
  'goat-wrangler':  { word: 'Goat Wrangler',  art: 'badge-goat',     about: 'Counted all seven goats home.' },
  'night-watch':    { word: 'Night Watch',    art: 'badge-lantern',  about: 'Caught the Lantern Thief.' },
  'book-detective': { word: 'Book Detective', art: 'badge-book',     about: 'Solved The Library Ghost.' },
  'sign-fixer':     { word: 'Sign Fixer',     art: 'badge-sign',     about: 'Turned every sign right way up.' },
  'three-stars':    { word: 'Three Stars',    art: 'badge-star',     about: 'A three-star class.' },
  'ten-days':       { word: 'Ten Days',       art: 'badge-sun',      about: 'Ten school days.' },
  'together':       { word: 'Together',       art: 'badge-hands',    about: 'Cast a together spell.' },
  'all-three':      { word: 'All Three',      art: 'badge-trio',     about: 'Cast a spell with all three princesses.' },
  'pure-of-heart':  { word: 'Pure of Heart',  art: 'badge-heart',    about: 'Passed the Headmistress\'s test.' },
};

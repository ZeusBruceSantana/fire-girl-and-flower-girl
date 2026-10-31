'use strict';
/* THE LAIR: the girls' secret headquarters in an old root cellar under the library.
   Upgrades are bought with Friendship Hearts from the shared Lair fund (never with coins, never with power).
   Each upgrade changes the lair scene (an extra "mid" layer piece) and may unlock something.

   Fields:
     id, word     name
     hearts       cost from the shared fund
     needs        another upgrade id first, or null
     art          the layer piece drawn into the lair scene when owned (art/scenes/lair/upgrade-<art>.svg|png)
     unlocks      what it does: 'map' (the world map on the wall), 'gallery', 'cases', 'visits', 'snacks', 'stuffies', 'music', 'telescope'
     about        one line, read aloud */

const LAIR = {
  upgrades: [
    { id: 'cushions',   word: 'cushions',      hearts: 0,  needs: null,       art: 'cushions',   unlocks: null,        about: 'Three cushions, one each. The first thing they brought down.' },
    { id: 'lantern',    word: 'big lantern',   hearts: 3,  needs: null,       art: 'lantern',    unlocks: null,        about: 'Fire Girl lights it, Flower Girl holds it, Electric Girl makes it hum. Never goes out.' },
    { id: 'case-board', word: 'case board',    hearts: 4,  needs: 'lantern',  art: 'caseboard',  unlocks: 'cases',     about: 'A cork board with string and pins. Where the clues go.' },
    { id: 'map-wall',   word: 'map wall',      hearts: 5,  needs: 'lantern',  art: 'map',        unlocks: 'map',       about: 'A map of the woods and the town, drawn by hand. Tap a place to go.' },
    { id: 'gallery',    word: 'gallery wall',  hearts: 5,  needs: null,       art: 'gallery',    unlocks: 'gallery',   about: 'Pins for paintings. Art class comes home.' },
    { id: 'snack-corner', word: 'snack corner', hearts: 6, needs: 'cushions', art: 'snacks',     unlocks: 'snacks',    about: 'A tin of biscuits and a jug. Friends who visit get a snack.' },
    { id: 'guest-cushion', word: 'guest cushion', hearts: 6, needs: 'snack-corner', art: 'guest', unlocks: 'visits',   about: 'A fourth cushion. Now a friend can be invited down.' },
    { id: 'stuffie-bed', word: 'stuffie bed',   hearts: 8,  needs: 'cushions', art: 'stuffies',   unlocks: 'stuffies',  about: 'A little bed for a stuffed animal who keeps watch.' },
    { id: 'bookshelf',  word: 'bookshelf',     hearts: 8,  needs: 'lantern',  art: 'bookshelf',  unlocks: 'scrolls',   about: 'For the Myth Scrolls. Professor Hoot would approve, if he knew.' },
    { id: 'radio',      word: 'crystal radio', hearts: 10, needs: 'lantern',  art: 'radio',      unlocks: 'music',     about: 'Electric Girl built it. Plays one station: the Lair\'s own tune.' },
    { id: 'telescope',  word: 'periscope',     hearts: 12, needs: 'map-wall', art: 'periscope',  unlocks: 'telescope', about: 'Pokes up through a drain in the town square. See who is about before you go.' },
  ],

  /* The shared Lair fund gets this share of every Heart a hero earns (the rest is hers, with that friend). */
  fundShare: 0.5,
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

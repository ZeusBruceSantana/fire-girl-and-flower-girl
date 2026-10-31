'use strict';
/* MAP AREAS. The world map shows these as tiles. Tap to travel (no walking, no reflexes).
   An area unlocks when EITHER hero reaches its level, so nobody is ever locked out of her sister's adventure.

   Fields:
     id        short unique name used in saves
     word      the name a player sees and can tap to hear
     unlock    hero level that opens it (1 = open from the start)
     kingdom   'emberfall' | 'petalvale' | 'between' (flavor only)
     art       picture id for the map tile
     quests    quest ids found here (see data/quests.js)
     finds     item ids that can be found here, with how often (uses RARITY weights on top)
     about     one line, read aloud on the map */

const AREAS = [
  { id: 'town',        word: 'Middlemarket',    unlock: 1, kingdom: 'between',   art: 'town',
    quests: ['oven-out', 'lost-seeds'],
    finds: ['gem-amber', 'seed-sun', 'crown-paper'],
    about: 'The town square. Shops, friends, and always a small problem to fix.' },

  { id: 'school',      word: 'Thistledown School', unlock: 1, kingdom: 'between', art: 'school',
    quests: ['library-mixup'],
    finds: ['book-small-magic', 'wand-twig', 'gem-amber'],
    about: 'Where the two princesses met. Professor Hoot is usually in the library.' },

  { id: 'orchard',     word: 'Petalvale Orchard', unlock: 2, kingdom: 'petalvale', art: 'orchard',
    quests: ['grumpy-weeds'],
    finds: ['seed-sun', 'gem-dewdrop', 'crown-daisy', 'cape-petal'],
    about: 'Apple trees, bees and one very grumpy weed.' },

  { id: 'lantern-lane', word: 'Lantern Lane',   unlock: 3, kingdom: 'emberfall', art: 'lane',
    quests: ['dark-lane'],
    finds: ['gem-amber', 'wand-candle', 'cape-ember', 'boots-spark'],
    about: 'The street of a hundred lamps. Tonight, most of them are out.' },

  { id: 'frost-pond',  word: 'Frost Pond',      unlock: 5, kingdom: 'between',   art: 'pond',
    quests: ['cold-snap'],
    finds: ['gem-dewdrop', 'crown-moon', 'boots-spark'],
    about: 'A pond between the kingdoms that froze when it should not have. Needs both kinds of magic.' },

  { id: 'festival-hill', word: 'Festival Hill', unlock: 8, kingdom: 'between',   art: 'hill',
    quests: ['ember-bloom-festival'],
    finds: ['gem-ember-bloom', 'wand-sunstone'],
    about: 'Where both kingdoms meet once a year. This year the princesses are in charge.' },
];

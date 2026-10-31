'use strict';
/* OVERWORLD MAPS (version 3). Big painted top-down maps the party walks across. Tap where to go; the game
   finds a path along the walkable areas. Troubles roam in the open: walk into one and a battle starts.

   Art: art/maps/<id>/full.svg (placeholder) or full.png (purchased, listed in art/overrides.js), 4096 x 3072.
   Positions below are in those units. Rects are [x, y, w, h].

   Fields:
     id, word       name, read aloud on arrival
     size           [w, h] of the painting
     walk           walkable rects (the paths and plazas); everything else is blocked
     spawn          where the party appears when it arrives from each place: { from: [x, y] }, 'default' for the rest
     tint           time-of-day feel (see scene.js TINTS); the school clock overrides it
     particles      ambient effect
     backdrop       scene id whose painting is the battle backdrop here
     doors          [{ id, word, rect, to: 'scene:<id>' | 'map:<id>', at, locked?: flag }]  'locked' = a flag that must be set
     things         [{ id, word, kind: 'chest' | 'sparkle' | 'sign', rect, item?, chance?, text? }]
     npcs           [{ id, word, who (WORLD.people / teachers id), x, y, talk? }]
     troubles       [{ id, kind (WORLD.troubles id), x, y, roam: rect, level, boss?: true }]   */

const MAPS = {
  'school-grounds': {
    word: 'the school grounds', size: [4096, 3072], tint: 'morning', particles: 'petals', backdrop: 'academy-gate',
    walk: [[1898, 1000, 300, 1950], [900, 1600, 1150, 200], [2048, 1400, 1300, 200], [2048, 2400, 1700, 250],
           [600, 1400, 600, 600], [3100, 1100, 600, 500], [1700, 2700, 700, 250], [3550, 2550, 350, 350]],
    spawn: { default: [2048, 1150], 'scene:dorm': [2048, 1150], 'map:whispering-woods': [3700, 2700] },
    doors: [
      { id: 'front-doors', word: 'the school doors', rect: [1880, 900, 340, 180], to: 'scene:dorm', at: 1280 },
      { id: 'gate',        word: 'the gate',         rect: [1880, 2900, 340, 172], to: 'map:whispering-woods', at: [300, 350], locked: 'gate-open', lockedSay: 'The gate is locked. Princesses stay inside the wall... officially.' },
      { id: 'gap',         word: 'a gap in the wall', rect: [3700, 2650, 200, 250], to: 'map:whispering-woods', at: [300, 350], secret: true },
    ],
    things: [
      { id: 'sign-garden', word: 'a signpost', kind: 'sign', rect: [1750, 1560, 120, 120], text: 'Garden. Fountain. No splashing.' },
      { id: 'sparkle-1',   word: 'a sparkle',  kind: 'sparkle', rect: [3450, 1200, 80, 80], item: 'seed-sun' },
      { id: 'chest-greenhouse', word: 'an old chest', kind: 'chest', rect: [3150, 1150, 140, 110], inside: [{ item: 'wand-twig', chance: 1 }, { item: 'gem-amber', chance: 0.4 }] },
    ],
    npcs: [
      { id: 'fern', word: 'Old Fern', who: 'gardener', x: 820, y: 1500, talk: 'My seeds! Always my seeds. Have you seen a sun seed? Yellow, round, likes jokes.' },
    ],
    troubles: [
      { id: 't-weed-1', kind: 'grumpy-weed', x: 2900, y: 1500, roam: [2600, 1400, 800, 220], level: 1 },
    ],
  },

  'whispering-woods': {
    word: 'the Whispering Woods', size: [4096, 3072], tint: 'day', particles: 'leaves', backdrop: 'woods-path',
    walk: [[200, 200, 900, 300], [900, 200, 300, 900], [900, 900, 1200, 300], [1900, 900, 300, 1000], [700, 1600, 700, 500],
           [1000, 1700, 1200, 300], [1900, 1700, 1500, 300], [2600, 1500, 600, 500], [3200, 1700, 300, 900], [3000, 2500, 900, 400], [3300, 900, 400, 300]],
    spawn: { default: [300, 350], 'map:school-grounds': [300, 350], 'map:middlemarket': [3800, 2700], 'scene:lair': [900, 1750] },
    doors: [
      { id: 'back',  word: 'back to school',   rect: [200, 200, 160, 300],  to: 'map:school-grounds', at: [3700, 2700] },
      { id: 'town',  word: 'the town',         rect: [3740, 2500, 160, 400], to: 'map:middlemarket', at: [2048, 700] },
      { id: 'cave',  word: 'a dark cave',      rect: [3560, 900, 140, 200],  to: 'scene:tunnel', at: 300, locked: 'flash-cave', lockedSay: 'Too dark to see. A flash of light would help.' },
    ],
    things: [
      { id: 'sign-woods', word: 'a signpost', kind: 'sign', rect: [400, 520, 120, 120], text: 'Whispering Woods. Mind the weeds.' },
      { id: 'chest-stump', word: 'a mossy chest', kind: 'chest', rect: [760, 1640, 140, 110], inside: [{ item: 'crown-paper', chance: 1 }, { item: 'gem-dewdrop', chance: 0.3 }] },
      { id: 'sparkle-2', word: 'a sparkle', kind: 'sparkle', rect: [2900, 1550, 80, 80], item: 'gem-amber' },
      { id: 'sparkle-3', word: 'a sparkle', kind: 'sparkle', rect: [3300, 2300, 80, 80], item: 'seed-sun' },
    ],
    npcs: [],
    troubles: [
      { id: 't-weed-2',  kind: 'grumpy-weed',  x: 1500, y: 1000, roam: [950, 950, 1100, 200], level: 1 },
      { id: 't-smoke-1', kind: 'sneezy-smoke', x: 2000, y: 1400, roam: [1920, 1000, 260, 800], level: 2 },
      { id: 't-frost-1', kind: 'cold-snap',    x: 2900, y: 1800, roam: [2600, 1550, 600, 400], level: 2 },
      { id: 't-weed-boss', kind: 'grumpy-weed', x: 3350, y: 2300, roam: [3250, 1800, 200, 700], level: 3, boss: true },
    ],
  },

  'middlemarket': {
    word: 'Middlemarket', size: [4096, 3072], tint: 'day', particles: 'bubbles', backdrop: 'town-square',
    walk: [[1948, 500, 200, 900], [1400, 1300, 1300, 900], [2700, 1850, 1100, 250], [3300, 1500, 600, 800], [900, 2200, 1100, 220], [700, 2000, 300, 500]],
    spawn: { default: [2048, 700], 'map:whispering-woods': [2048, 700] },
    doors: [
      { id: 'bridge', word: 'the bridge to the woods', rect: [1948, 300, 200, 200], to: 'map:whispering-woods', at: [3800, 2700] },
    ],
    things: [
      { id: 'sign-square', word: 'a signpost', kind: 'sign', rect: [1420, 1250, 120, 120], text: 'Middlemarket. Bakery left. Constable right. Market this way.' },
      { id: 'sparkle-4', word: 'a sparkle', kind: 'sparkle', rect: [3700, 2200, 80, 80], item: 'gem-amber' },
    ],
    npcs: [
      { id: 'pebble', word: 'Constable Pebble', who: 'pebble',      x: 2950, y: 1650, talk: 'Junior Helpers! No cases today... which means a case is coming. They always come.' },
      { id: 'crumb',  word: 'Mrs. Crumb',       who: 'baker',       x: 1150, y: 1650, shop: 'bakery' },
      { id: 'nell',   word: 'Nell',             who: 'goatherd',    x: 3600, y: 1700, shop: 'market' },
      { id: 'tilt',   word: 'Mr. Tilt',         who: 'signpainter', x: 2300, y: 1000, talk: 'Painting the clock tower sign. Upside down? No! ...Is it?' },
      { id: 'cook',   word: 'Cook',             who: 'cook',        x: 850,  y: 2250 },
    ],
    troubles: [
      { id: 't-smoke-town', kind: 'sneezy-smoke', x: 3500, y: 2100, roam: [3320, 1900, 560, 380], level: 2 },
    ],
  },
};

'use strict';
/* OVERWORLD MAPS (version 3). Big painted top-down maps the party walks across. Tap where to go; the game
   finds a path along the walkable areas. Troubles roam in the open: walk into one and a battle starts.

   Art: art/maps/<id>/full.svg (placeholder) or full.jpg / full.png (painted, listed in art/overrides.js), drawn at 4096 x 3072.
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
     troubles       [{ id, kind (WORLD.troubles id), x, y, roam: rect, level, boss?: true, pack?, only? }]
                      level: a number, or 'party' (the average level of the players here, at least 1) or 'party+1'
                      pack:  [{ kind, level }] extra troubles that join the same battle, one after the other
                      only:  { weather: 'rain' | 'sun' | 'storm' | 'cloud' } or { part: 'bedtime' | 'free' | ... }:
                             the trouble only comes out when that holds (weather by day in data/school.js; part is the clock)
   The daily wanted trouble (data/cases.js WANTED) is added to its map by the game, not listed here. */

const MAPS = {
  'school-grounds': {
    word: 'the school grounds', size: [4096, 3072], tint: 'morning', particles: 'petals', backdrop: 'academy-gate',
    walk: [[1664, 704, 192, 1920], [896, 1088, 64, 704], [640, 1280, 256, 512], [960, 1280, 192, 512], [384, 1344, 256, 384], [1152, 1344, 320, 448],
           [2624, 1408, 832, 128], [1856, 1472, 768, 128], [1856, 1664, 64, 1408], [512, 1728, 128, 64], [1472, 1728, 192, 64], [1408, 1792, 192, 64],
           [1280, 2112, 384, 512], [512, 2176, 768, 448], [448, 2304, 64, 320], [1920, 2304, 1664, 128], [3584, 2368, 256, 64], [1920, 2432, 64, 640],
           [3648, 2432, 192, 64], [3712, 2496, 192, 64], [3776, 2560, 128, 128], [1728, 2624, 128, 448], [3904, 2624, 64, 192], [3840, 2688, 64, 128]],   // traced on the painting (64-unit cells)
    spawn: { default: [1760, 900], 'scene:dorm': [1760, 900], 'map:whispering-woods': [3640, 2400] },
    doors: [
      { id: 'front-doors', word: 'the school doors', rect: [1640, 480, 240, 300], to: 'scene:dorm', at: 1280 },
      { id: 'gate',        word: 'the gate',         rect: [1720, 2560, 260, 300], to: 'map:whispering-woods', at: [400, 420], locked: 'gate-open', lockedSay: 'The gate is locked. Princesses stay inside the wall... officially.' },
      { id: 'gap',         word: 'a gap in the wall', rect: [3760, 2560, 260, 260], to: 'map:whispering-woods', at: [400, 420], secret: true },
    ],
    things: [
      { id: 'sign-garden', word: 'a signpost', kind: 'sign', rect: [1580, 1360, 120, 120], text: 'Garden. Fountain. No splashing.' },
      { id: 'sparkle-1',   word: 'a sparkle',  kind: 'sparkle', rect: [2300, 1440, 80, 80], item: 'seed-sun' },
      { id: 'chest-greenhouse', word: 'an old chest', kind: 'chest', rect: [3300, 1330, 140, 110], inside: [{ item: 'wand-twig', chance: 1 }, { item: 'gem-amber', chance: 0.4 }] },
    ],
    npcs: [
      { id: 'fern', word: 'Old Fern', who: 'gardener', x: 560, y: 1640, talk: 'My seeds! Always my seeds. Have you seen a sun seed? Yellow, round, likes jokes.' },
    ],
    troubles: [
      { id: 't-weed-1', kind: 'grumpy-weed', x: 2900, y: 1520, roam: [2400, 1460, 900, 140], level: 1 },
      { id: 't-static-night', kind: 'static-sprite', x: 900, y: 1500, roam: [460, 1360, 880, 380], level: 'party', only: { part: 'bedtime' } },   // only after dark
    ],
  },

  'whispering-woods': {
    word: 'the Whispering Woods', size: [4096, 3072], tint: 'day', particles: 'leaves', backdrop: 'woods-path',
    walk: [[320, 64, 128, 448], [448, 320, 1024, 192], [1472, 384, 256, 128], [1728, 448, 512, 128], [3328, 448, 192, 128], [1280, 512, 192, 64],
           [2240, 512, 192, 128], [3200, 512, 128, 128], [1344, 576, 128, 832], [2112, 576, 128, 64], [2432, 576, 192, 128], [3008, 576, 192, 128],
           [3328, 576, 64, 64], [2368, 640, 64, 64], [2624, 640, 384, 128], [3200, 640, 64, 64], [2560, 704, 64, 64], [3008, 704, 64, 64],
           [2752, 768, 128, 64], [1472, 1152, 64, 256], [1536, 1216, 64, 192], [1024, 1280, 320, 128], [1600, 1280, 384, 128], [896, 1344, 128, 192],
           [1984, 1344, 64, 384], [832, 1408, 64, 384], [1024, 1408, 192, 64], [1856, 1408, 128, 128], [2048, 1408, 64, 384], [768, 1472, 64, 192],
           [896, 1536, 64, 256], [1920, 1536, 64, 64], [2112, 1536, 64, 256], [960, 1600, 64, 256], [2176, 1600, 128, 192], [2624, 1600, 640, 192],
           [1024, 1664, 128, 192], [2304, 1664, 320, 128], [3264, 1664, 320, 192], [1152, 1728, 64, 384], [3584, 1728, 64, 1088], [320, 1792, 448, 192],
           [768, 1856, 192, 192], [1088, 1856, 64, 320], [1216, 1856, 64, 192], [3456, 1856, 128, 128], [3648, 1856, 64, 640], [512, 1984, 256, 64],
           [1024, 1984, 64, 192], [3520, 1984, 64, 832], [896, 2048, 128, 192], [3456, 2432, 64, 384], [3072, 2496, 384, 256], [3648, 2560, 192, 256],
           [3840, 2624, 256, 256], [3264, 2752, 192, 64], [3712, 2816, 128, 64]],   // traced on the painting (64-unit cells)
    spawn: { default: [400, 420], 'map:school-grounds': [400, 420], 'map:middlemarket': [3700, 2680], 'scene:lair': [700, 1900] },
    doors: [
      { id: 'back',  word: 'back to school',   rect: [300, 60, 240, 300],  to: 'map:school-grounds', at: [3640, 2400] },
      { id: 'town',  word: 'the town',         rect: [3860, 2560, 236, 400], to: 'map:middlemarket', at: [2040, 380] },
      { id: 'cave',  word: 'a dark cave',      rect: [3360, 260, 240, 260],  to: 'scene:tunnel', at: 300, locked: 'flash-cave', lockedSay: 'Too dark to see. A flash of light would help.' },
    ],
    things: [
      { id: 'sign-woods', word: 'a signpost', kind: 'sign', rect: [690, 260, 120, 120], text: 'Whispering Woods. Mind the weeds.' },
      { id: 'chest-stump', word: 'a mossy chest', kind: 'chest', rect: [900, 1840, 140, 110], inside: [{ item: 'crown-paper', chance: 1 }, { item: 'gem-dewdrop', chance: 0.3 }] },
      { id: 'sparkle-2', word: 'a sparkle', kind: 'sparkle', rect: [2240, 1680, 80, 80], item: 'gem-amber' },
      { id: 'sparkle-3', word: 'a sparkle', kind: 'sparkle', rect: [3400, 2560, 80, 80], item: 'seed-sun' },
      { id: 'sparkle-hidden-1', word: 'a hidden sparkle', kind: 'sparkle', rect: [1000, 1960, 80, 80], item: 'gem-dewdrop', hidden: true },   // only with sparkle-finding boots
    ],
    npcs: [],
    troubles: [
      { id: 't-weed-2',  kind: 'grumpy-weed',  x: 900, y: 410, roam: [500, 360, 900, 120], level: 'party' },
      { id: 't-smoke-1', kind: 'sneezy-smoke', x: 1420, y: 900, roam: [1380, 560, 120, 640], level: 'party' },
      { id: 't-frost-1', kind: 'cold-snap',    x: 2900, y: 1720, roam: [2400, 1660, 1100, 140], level: 'party' },
      { id: 't-frost-rain', kind: 'cold-snap', x: 1000, y: 1700, roam: [880, 1500, 320, 560], level: 'party', only: { weather: 'rain' } },   // only in the rain
      { id: 't-weed-boss', kind: 'grumpy-weed', x: 3500, y: 2640, roam: [3040, 2520, 900, 220], level: 'party+1', boss: true },
    ],
  },

  'middlemarket': {
    word: 'Middlemarket', size: [4096, 3072], tint: 'day', particles: 'bubbles', backdrop: 'town-square',
    walk: [[1920, 0, 256, 2048], [1408, 1152, 512, 896], [2176, 1152, 448, 896], [64, 1408, 640, 128], [960, 1408, 448, 384], [2624, 1408, 448, 384],
           [704, 1472, 256, 128], [192, 1536, 512, 64], [3072, 1536, 320, 384], [3392, 1600, 64, 128], [1216, 1792, 192, 192], [2624, 1792, 64, 256],
           [2880, 1792, 192, 64], [3392, 1792, 256, 192], [1024, 1856, 192, 192], [3648, 1856, 320, 192], [320, 1920, 320, 192], [832, 1920, 192, 192],
           [3328, 1920, 64, 64], [3968, 1920, 128, 192], [640, 1984, 192, 128], [1216, 1984, 64, 64], [3520, 1984, 128, 64], [1024, 2048, 128, 64],
           [1920, 2048, 192, 256], [3904, 2048, 64, 64]],   // traced on the painting (64-unit cells)
    spawn: { default: [2040, 380], 'map:whispering-woods': [2040, 380], 'map:petalvale-orchard': [3800, 1990] },
    doors: [
      { id: 'bridge', word: 'the bridge to the woods', rect: [1940, 20, 220, 200], to: 'map:whispering-woods', at: [3700, 2680] },
      { id: 'orchard-road', word: 'the road to the orchard', rect: [3960, 1860, 136, 280], to: 'map:petalvale-orchard', at: [240, 1340], locked: 'route-2', lockedSay: 'The orchard road. Professor Hoot said we may go once we have read the story of the seasons.' },
    ],
    things: [
      { id: 'sign-square', word: 'a signpost', kind: 'sign', rect: [1280, 1400, 120, 120], text: 'Middlemarket. Bakery left. Constable right. Market this way.' },
      { id: 'sparkle-4', word: 'a sparkle', kind: 'sparkle', rect: [3800, 1950, 80, 80], item: 'gem-amber' },
    ],
    npcs: [
      { id: 'pebble', word: 'Constable Pebble', who: 'pebble',      x: 2650, y: 1520, talk: 'Junior Helpers! No cases today... which means a case is coming. They always come.' },
      { id: 'crumb',  word: 'Mrs. Crumb',       who: 'baker',       x: 1420, y: 1440, shop: 'bakery' },
      { id: 'nell',   word: 'Nell',             who: 'goatherd',    x: 3500, y: 1900, shop: 'market' },
      { id: 'tilt',   word: 'Mr. Tilt',         who: 'signpainter', x: 2180, y: 1100, talk: 'Painting the clock tower sign. Upside down? No! ...Is it?' },
      { id: 'cook',   word: 'Cook',             who: 'cook',        x: 850,  y: 2250 },
    ],
    troubles: [
      { id: 't-smoke-town', kind: 'sneezy-smoke', x: 3300, y: 1840, roam: [2880, 1760, 960, 200], level: 'party' },
    ],
  },

  'petalvale-orchard': {
    word: 'Petalvale Orchard', size: [4096, 3072], tint: 'day', particles: 'petals', backdrop: 'woods-path',
    walk: [[448, 256, 256, 128], [704, 320, 320, 128], [512, 384, 192, 64], [1024, 384, 384, 192], [1984, 384, 192, 256], [768, 448, 256, 64],
           [1408, 448, 448, 128], [896, 512, 128, 64], [1856, 512, 128, 128], [2176, 512, 960, 128], [1024, 576, 192, 128], [1600, 576, 256, 64],
           [2496, 640, 640, 64], [1088, 704, 128, 768], [2560, 704, 128, 960], [3840, 704, 128, 320], [3776, 832, 64, 448], [3840, 1024, 64, 576],
           [1216, 1088, 64, 512], [3904, 1152, 64, 448], [0, 1216, 320, 192], [320, 1280, 704, 192], [1024, 1344, 64, 128], [1280, 1344, 64, 448],
           [3968, 1344, 64, 256], [256, 1408, 64, 64], [1344, 1408, 1216, 128], [2688, 1408, 1152, 128], [4032, 1408, 64, 192], [1152, 1472, 64, 64],
           [1344, 1536, 64, 832], [2688, 1536, 64, 448], [2880, 1536, 960, 64], [1408, 1600, 64, 768], [2752, 1600, 64, 448], [2944, 1600, 832, 256],
           [2624, 1664, 64, 192], [1472, 1792, 64, 192], [2816, 1792, 64, 320], [2880, 1856, 64, 320], [3328, 1856, 448, 64], [2944, 1920, 64, 448],
           [1280, 1984, 64, 384], [3008, 1984, 64, 384], [3072, 2048, 64, 320], [3136, 2112, 960, 128], [1088, 2176, 192, 192], [1472, 2176, 64, 192],
           [896, 2240, 192, 192], [1536, 2240, 256, 128], [2752, 2240, 192, 192], [3136, 2240, 64, 64], [3264, 2240, 704, 64], [704, 2304, 192, 192],
           [1792, 2304, 256, 128], [2624, 2304, 128, 192], [512, 2368, 192, 192], [1600, 2368, 192, 64], [2048, 2368, 576, 128], [320, 2432, 192, 128],
           [1856, 2432, 192, 64], [320, 2560, 128, 64]],   // traced on the painting (64-unit cells)
    spawn: { default: [240, 1340], 'map:middlemarket': [240, 1340], 'map:whispering-woods': [240, 1340], 'map:thunder-peak': [3880, 1480] },
    doors: [
      { id: 'back',  word: 'back to town',          rect: [0, 1200, 180, 280],  to: 'map:middlemarket', at: [3800, 1990] },
      { id: 'gate',  word: 'Persephone\'s Gate',     rect: [1960, 220, 240, 280],  to: 'scene:woods-path', at: 1280, locked: 'gate-of-seasons', lockedSay: 'The gate is half frozen and half scorched. It only opens for warm AND growing, together.' },
      { id: 'peak',  word: 'the path up to Thunder Peak', rect: [3760, 700, 240, 320], to: 'map:thunder-peak', at: [320, 2460], locked: 'route-3', lockedSay: 'The path up to the peak. Professor Hoot said: after the story of Zeus.' },
    ],
    things: [
      { id: 'sign-orchard', word: 'a signpost', kind: 'sign', rect: [680, 1220, 120, 120], text: 'Petalvale Orchard. Apples free. Weeds not.' },
      { id: 'chest-orchard', word: 'a chest under the apple tree', kind: 'chest', rect: [2240, 2280, 140, 110], inside: [{ item: 'crown-daisy', chance: 0.6 }, { item: 'petals', chance: 1 }] },
      { id: 'sparkle-5', word: 'a sparkle', kind: 'sparkle', rect: [3440, 1760, 80, 80], item: 'gem-dewdrop' },
      { id: 'sparkle-6', word: 'a sparkle', kind: 'sparkle', rect: [1480, 480, 80, 80], item: 'seed-sun' },
    ],
    npcs: [
      { id: 'fern-orchard', word: 'Old Fern', who: 'gardener', x: 1360, y: 1880, talk: 'The gate at the top of the orchard froze on one side and scorched on the other. Just like the old story. Hmm.' },
    ],
    troubles: [
      { id: 't-weed-3',   kind: 'grumpy-weed',  x: 1900, y: 1470, roam: [1320, 1400, 1240, 120], level: 'party' },
      { id: 't-frost-2',  kind: 'cold-snap',    x: 2620, y: 1000, roam: [2560, 640, 120, 800], level: 'party' },
      { id: 't-smoke-2',  kind: 'sneezy-smoke', x: 3400, y: 1720, roam: [3120, 1560, 680, 360], level: 'party', pack: [{ kind: 'grumpy-weed', level: 'party' }] },   // two at once
      { id: 't-frost-boss', kind: 'cold-snap',  x: 2100, y: 580,  roam: [1920, 520, 480, 120], level: 'party+1', boss: true },
    ],
  },

  'thunder-peak': {
    word: 'Thunder Peak', size: [4096, 3072], tint: 'evening', particles: 'sparks', backdrop: 'tunnel',
    walk: [[3648, 256, 128, 192], [3584, 320, 64, 384], [3520, 384, 64, 448], [3648, 448, 64, 128], [3456, 576, 64, 256], [3328, 640, 128, 192],
           [2816, 704, 512, 128], [2752, 768, 64, 384], [2816, 832, 192, 64], [2688, 896, 64, 320], [2816, 896, 128, 64], [2816, 960, 64, 128],
           [2624, 1024, 64, 320], [2560, 1088, 64, 256], [2432, 1152, 128, 192], [1472, 1216, 960, 128], [1088, 1280, 384, 128], [1024, 1344, 64, 448],
           [1472, 1344, 896, 64], [1088, 1408, 192, 704], [1280, 1792, 576, 192], [1280, 1984, 64, 576], [1344, 2048, 64, 448], [1152, 2112, 128, 192],
           [1408, 2240, 64, 256], [1216, 2304, 64, 256], [0, 2368, 1216, 192]],   // traced on the painting (64-unit cells)
    spawn: { default: [320, 2460], 'map:petalvale-orchard': [320, 2460] },
    doors: [
      { id: 'down', word: 'the way down', rect: [0, 2340, 180, 280], to: 'map:petalvale-orchard', at: [3880, 1480] },
    ],
    things: [
      { id: 'sign-peak', word: 'a signpost', kind: 'sign', rect: [330, 2240, 120, 120], text: 'Thunder Peak. Hold on to your hats.' },
      { id: 'chest-peak', word: 'a chest in the clouds', kind: 'chest', rect: [1720, 1800, 140, 110], inside: [{ item: 'spark-dust', chance: 1 }, { item: 'crown-moon', chance: 0.2 }] },
      { id: 'sparkle-7', word: 'a sparkle', kind: 'sparkle', rect: [3440, 320, 80, 80], item: 'gem-dewdrop' },
      { id: 'sparkle-8', word: 'a sparkle', kind: 'sparkle', rect: [2360, 1240, 80, 80], item: 'spark-dust' },
    ],
    npcs: [],
    troubles: [
      { id: 't-static-1', kind: 'static-sprite', x: 1220, y: 1900, roam: [1140, 1480, 240, 920], level: 'party' },
      { id: 't-static-2', kind: 'static-sprite', x: 1900, y: 1320, roam: [1240, 1280, 1360, 120], level: 'party', pack: [{ kind: 'static-sprite', level: 'party' }] },   // two at once
      { id: 't-static-boss', kind: 'static-sprite', x: 3600, y: 460, roam: [3480, 320, 280, 440], level: 'party+1', boss: true },
    ],
  },
};

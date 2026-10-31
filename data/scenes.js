'use strict';
/* SCENES: every place the heroes can stand. A scene is a painted background in layers plus a walk path and hotspots.
   The art lives in art/scenes/<id>/<layer>.svg (placeholder) or .png (purchased). See docs/ART-STYLE.md.

   The logical scene is 2560 x 1440. Positions below are in those units.

   Fields:
     id, word        name, read aloud on arrival
     layers          which of sky / far / mid / near exist (missing ones are skipped)
     tint            time-of-day feel: 'morning' | 'day' | 'evening' | 'night' | 'lantern' | 'none'
     particles       ambient effect: 'embers' | 'petals' | 'sparks' | 'fireflies' | 'dust' | 'leaves' | 'bubbles' | null
     path            the walk path: points the heroes walk along, left to right. Heroes stand on it.
     spawn           where each seat starts: { left, right, away } as x positions on the path
     hotspots        things to tap. Each: id, word (read aloud), rect [x, y, w, h], kind, and what it does:
                       kind 'exit'  -> { to: sceneId, at: x }      walk there then travel
                       kind 'npc'   -> { npc: id }                 walk up and talk (Epic 1+)
                       kind 'thing' -> { action: name }            walk up and do (js/day.js, Day.onThing)
                         actions: sleep, lesson, sit, inventory, cases, map, upgrades, gallery, invite, scrolls,
                         outfits (the wardrobe opens the Bag), wish (one wish a day: a little ember),
                         anything else: the hero says the hotspot's "say" line, or its word
                       say      -> a line the hero says on arrival (used by 'wish' and by any plain thing)
                       needs    -> a Lair upgrade id; the hotspot stays hidden until that upgrade is bought
     music           track id (procedural, Epic 8) */

const SCENE_SIZE = { w: 2560, h: 1440 };

const SCENES = {
  'academy-gate': { word: 'the Academy gate', layers: ['sky', 'far', 'mid', 'near'], tint: 'morning', particles: 'petals',
    path: [[200, 1260], [1280, 1230], [2360, 1260]], spawn: { left: 900, right: 1660, away: 1280 },
    hotspots: [
      { id: 'gate', word: 'the gate', rect: [1120, 470, 320, 500], kind: 'exit', to: 'dorm', at: 1280 },
    ] },

  'dorm': { word: 'the dorm', layers: ['sky', 'far', 'mid', 'near'], tint: 'morning', particles: 'dust',
    path: [[260, 1280], [1280, 1280], [2300, 1280]], spawn: { left: 700, right: 1860, away: 1280 },
    hotspots: [
      { id: 'bed-fire',     word: 'a bed',      rect: [140, 490, 560, 470],  kind: 'thing', action: 'sleep' },
      { id: 'bed-flower',   word: 'a bed',      rect: [870, 490, 410, 450], kind: 'thing', action: 'sleep' },
      { id: 'bed-electric', word: 'a bed',      rect: [1650, 490, 600, 470], kind: 'thing', action: 'sleep' },
      { id: 'wardrobe',     word: 'the wardrobe', rect: [2280, 60, 280, 920], kind: 'thing', action: 'outfits' },
      { id: 'door',         word: 'the door',   rect: [0, 540, 130, 760],    kind: 'exit', to: 'classroom', at: 1280 },
      { id: 'outside',      word: 'outside',    rect: [2300, 1220, 240, 200], kind: 'exit', to: 'map:school-grounds' },
    ] },

  'classroom': { word: 'the classroom', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'dust',
    path: [[260, 1290], [1280, 1290], [2300, 1290]], spawn: { left: 760, right: 1800, away: 1280 },
    hotspots: [
      { id: 'board',   word: 'the chalkboard', rect: [990, 160, 670, 480], kind: 'thing', action: 'lesson' },
      { id: 'teacher', word: 'the teacher',    rect: [1820, 560, 440, 640], kind: 'npc', npc: 'teacher' },
      { id: 'door',    word: 'the door',       rect: [40, 520, 220, 700],   kind: 'exit', to: 'cafeteria', at: 1280 },
    ] },

  'cafeteria': { word: 'the cafeteria', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'dust',
    path: [[560, 1300], [1280, 1300], [2300, 1300]], spawn: { left: 700, right: 1960, away: 1280 },   // a bench sits at the bottom-left
    hotspots: [
      { id: 'counter', word: 'the ice cream cart', rect: [2150, 280, 400, 620], kind: 'npc', npc: 'cook' },
      { id: 'table-1', word: 'a table',  rect: [110, 640, 650, 200],  kind: 'thing', action: 'sit' },
      { id: 'table-2', word: 'a table',  rect: [580, 660, 1000, 280],  kind: 'thing', action: 'sit' },
      { id: 'door',    word: 'the door', rect: [480, 430, 150, 200],  kind: 'exit', to: 'library', at: 1280 },
    ] },

  'library': { word: 'the library', layers: ['sky', 'far', 'mid', 'near'], tint: 'evening', particles: 'dust',
    path: [[800, 1290], [1280, 1290], [2250, 1290]], spawn: { left: 900, right: 1760, away: 1280 },   // a book crate sits at the bottom-left
    hotspots: [
      { id: 'hoot',         word: 'Professor Hoot',   rect: [1000, 520, 360, 680],  kind: 'npc', npc: 'hoot' },
      { id: 'secret-shelf', word: 'the bottom shelf', rect: [2020, 600, 220, 360], kind: 'exit', to: 'tunnel', at: 300, secret: true },
      { id: 'door',         word: 'the door',         rect: [40, 520, 220, 700],    kind: 'exit', to: 'dorm', at: 1280 },
    ] },

  'tunnel': { word: 'the secret tunnel', layers: ['sky', 'far', 'mid', 'near'], tint: 'lantern', particles: 'sparks',
    path: [[200, 1250], [900, 1300], [1700, 1250], [2360, 1200]], spawn: { left: 300, right: 500, away: 400 },
    hotspots: [
      { id: 'back',  word: 'back up',     rect: [40, 400, 300, 900],    kind: 'exit', to: 'library', at: 2200 },
      { id: 'ahead', word: 'the glow',    rect: [2200, 500, 340, 800],  kind: 'exit', to: 'lair', at: 400 },
    ] },

  'lair': { word: 'the Lair', layers: ['sky', 'far', 'mid', 'near'], tint: 'lantern', particles: 'embers',
    path: [[260, 1280], [1280, 1280], [2300, 1280]], spawn: { left: 800, right: 1760, away: 1280 },
    hotspots: [
      { id: 'table',      word: 'the round table', rect: [1060, 740, 640, 220],  kind: 'thing', action: 'inventory' },
      { id: 'case-board', word: 'the case board',  rect: [1900, 210, 560, 420], kind: 'thing', action: 'cases' },
      { id: 'map-wall',   word: 'the map',         rect: [740, 240, 470, 430],  kind: 'thing', action: 'map' },
      { id: 'lantern',    word: 'the lantern',     rect: [530, 100, 200, 300], kind: 'thing', action: 'upgrades' },
      { id: 'till',       word: 'the till',        rect: [1400, 290, 360, 500], kind: 'thing', action: 'till' },   // the girls' own shop (js/till.js)
      { id: 'gallery',    word: 'the gallery wall', rect: [1200, 300, 180, 360], kind: 'thing', action: 'gallery', needs: 'gallery' },
      { id: 'cushions',   word: 'the cushions',    rect: [1640, 840, 280, 140], kind: 'thing', action: 'invite', needs: 'guest-cushion' },
      { id: 'bookshelf',  word: 'the bookshelf',   rect: [2040, 680, 260, 240], kind: 'thing', action: 'scrolls', needs: 'bookshelf' },
      { id: 'ladder',     word: 'the ladder up',   rect: [100, 60, 370, 880],  kind: 'exit', to: 'tunnel', at: 2200 },
      { id: 'out',        word: 'the way out',     rect: [2280, 500, 260, 800], kind: 'exit', to: 'map:whispering-woods' },
    ] },

  'woods-path': { word: 'the woods', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'leaves',
    path: [[600, 1260], [900, 1300], [1500, 1240], [2100, 1280]], spawn: { left: 800, right: 1100, away: 950 },   // the dirt path, clear of the ferns
    hotspots: [
      { id: 'back', word: 'back to the Lair', rect: [40, 500, 260, 800],   kind: 'exit', to: 'lair', at: 2200 },
      { id: 'on',   word: 'the path on',      rect: [1640, 600, 680, 300], kind: 'exit', to: 'map:whispering-woods' },
    ] },

  'town-square': { word: 'Middlemarket', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'bubbles',
    path: [[500, 1280], [1280, 1300], [2360, 1280]], spawn: { left: 700, right: 1100, away: 900 },   // clear of the bush at the bottom-left
    hotspots: [
      { id: 'pebble',  word: 'Constable Pebble', rect: [1840, 560, 360, 640], kind: 'npc', npc: 'pebble' },
      { id: 'bakery',  word: 'the bakery',       rect: [40, 380, 520, 520],  kind: 'npc', npc: 'baker' },
      { id: 'fountain', word: 'the fountain',    rect: [920, 570, 620, 400], kind: 'thing', action: 'wish', say: 'Splash! No splashing, says the sign. A wish, then. The water glows a little.' },
      { id: 'back',    word: 'the woods',        rect: [0, 900, 220, 540],   kind: 'exit', to: 'map:whispering-woods' },
    ] },
};

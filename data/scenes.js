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
      { id: 'gate', word: 'the gate', rect: [1120, 560, 320, 560], kind: 'exit', to: 'dorm', at: 1280 },
    ] },

  'dorm': { word: 'the dorm', layers: ['sky', 'far', 'mid', 'near'], tint: 'morning', particles: 'dust',
    path: [[260, 1280], [1280, 1280], [2300, 1280]], spawn: { left: 700, right: 1860, away: 1280 },
    hotspots: [
      { id: 'bed-fire',     word: 'a bed',      rect: [300, 760, 560, 400],  kind: 'thing', action: 'sleep' },
      { id: 'bed-flower',   word: 'a bed',      rect: [1000, 760, 560, 400], kind: 'thing', action: 'sleep' },
      { id: 'bed-electric', word: 'a bed',      rect: [1700, 760, 560, 400], kind: 'thing', action: 'sleep' },
      { id: 'wardrobe',     word: 'the wardrobe', rect: [2280, 560, 240, 640], kind: 'thing', action: 'outfits' },
      { id: 'door',         word: 'the door',   rect: [40, 520, 220, 700],   kind: 'exit', to: 'classroom', at: 1280 },
      { id: 'outside',      word: 'outside',    rect: [2300, 1220, 240, 200], kind: 'exit', to: 'map:school-grounds' },
    ] },

  'classroom': { word: 'the classroom', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'dust',
    path: [[260, 1290], [1280, 1290], [2300, 1290]], spawn: { left: 760, right: 1800, away: 1280 },
    hotspots: [
      { id: 'board',   word: 'the chalkboard', rect: [800, 280, 960, 520], kind: 'thing', action: 'lesson' },
      { id: 'teacher', word: 'the teacher',    rect: [1900, 560, 360, 640], kind: 'npc', npc: 'teacher' },
      { id: 'door',    word: 'the door',       rect: [40, 520, 220, 700],   kind: 'exit', to: 'cafeteria', at: 1280 },
    ] },

  'cafeteria': { word: 'the cafeteria', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'dust',
    path: [[260, 1300], [1280, 1300], [2300, 1300]], spawn: { left: 600, right: 1960, away: 1280 },
    hotspots: [
      { id: 'counter', word: 'the ice cream cart', rect: [1900, 600, 560, 560], kind: 'npc', npc: 'cook' },
      { id: 'table-1', word: 'a table',  rect: [200, 900, 600, 300],  kind: 'thing', action: 'sit' },
      { id: 'table-2', word: 'a table',  rect: [900, 900, 600, 300],  kind: 'thing', action: 'sit' },
      { id: 'door',    word: 'the door', rect: [40, 520, 220, 700],   kind: 'exit', to: 'library', at: 1280 },
    ] },

  'library': { word: 'the library', layers: ['sky', 'far', 'mid', 'near'], tint: 'evening', particles: 'dust',
    path: [[260, 1290], [1280, 1290], [2300, 1290]], spawn: { left: 800, right: 1760, away: 1280 },
    hotspots: [
      { id: 'hoot',         word: 'Professor Hoot',   rect: [1000, 520, 360, 680],  kind: 'npc', npc: 'hoot' },
      { id: 'secret-shelf', word: 'the bottom shelf', rect: [2100, 1040, 420, 220], kind: 'exit', to: 'tunnel', at: 300, secret: true },
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
      { id: 'table',      word: 'the round table', rect: [900, 860, 760, 380],  kind: 'thing', action: 'inventory' },
      { id: 'case-board', word: 'the case board',  rect: [1800, 300, 560, 560], kind: 'thing', action: 'cases' },
      { id: 'map-wall',   word: 'the map',         rect: [200, 300, 560, 560],  kind: 'thing', action: 'map' },
      { id: 'lantern',    word: 'the lantern',     rect: [1180, 120, 200, 260], kind: 'thing', action: 'upgrades' },
      { id: 'till',       word: 'the till',        rect: [1400, 420, 360, 380], kind: 'thing', action: 'till' },   // the girls' own shop (js/till.js)
      { id: 'gallery',    word: 'the gallery wall', rect: [760, 300, 420, 420], kind: 'thing', action: 'gallery', needs: 'gallery' },
      { id: 'cushions',   word: 'the cushions',    rect: [300, 1020, 500, 220], kind: 'thing', action: 'invite', needs: 'guest-cushion' },
      { id: 'bookshelf',  word: 'the bookshelf',   rect: [1900, 900, 440, 340], kind: 'thing', action: 'scrolls', needs: 'bookshelf' },
      { id: 'ladder',     word: 'the ladder up',   rect: [40, 300, 240, 1000],  kind: 'exit', to: 'tunnel', at: 2200 },
      { id: 'out',        word: 'the way out',     rect: [2280, 500, 260, 800], kind: 'exit', to: 'map:whispering-woods' },
    ] },

  'woods-path': { word: 'the woods', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'leaves',
    path: [[200, 1250], [800, 1300], [1500, 1240], [2360, 1280]], spawn: { left: 300, right: 520, away: 410 },
    hotspots: [
      { id: 'back', word: 'back to the Lair', rect: [40, 500, 260, 800],   kind: 'exit', to: 'lair', at: 2200 },
      { id: 'on',   word: 'the path on',      rect: [2260, 500, 280, 800], kind: 'exit', to: 'map:whispering-woods' },
    ] },

  'town-square': { word: 'Middlemarket', layers: ['sky', 'far', 'mid', 'near'], tint: 'day', particles: 'bubbles',
    path: [[200, 1280], [1280, 1300], [2360, 1280]], spawn: { left: 300, right: 520, away: 410 },
    hotspots: [
      { id: 'pebble',  word: 'Constable Pebble', rect: [1900, 560, 360, 680], kind: 'npc', npc: 'pebble' },
      { id: 'bakery',  word: 'the bakery',       rect: [300, 500, 560, 700],  kind: 'npc', npc: 'baker' },
      { id: 'fountain', word: 'the fountain',    rect: [1060, 700, 440, 440], kind: 'thing', action: 'wish', say: 'Splash! No splashing, says the sign. A wish, then. The water glows a little.' },
      { id: 'back',    word: 'the woods',        rect: [40, 500, 240, 800],   kind: 'exit', to: 'map:whispering-woods' },
    ] },
};

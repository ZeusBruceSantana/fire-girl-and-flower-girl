'use strict';
/* LIVING PAINTINGS: what moves in each painting (js/living.js). Positions are measured on the owner's paintings:
   rooms in scene units (2560 x 1440), maps in map units (4096 x 3072). Move freely when a painting changes.

     sun      true: warm sunlight wanders slowly across the room
     lights   [x, y, radius, colour]   lanterns, candles, windows: a soft pulse (Electric Girl makes them flicker)
     water    [x, y, w, h, 'ripple' | 'fall']   ripple shimmers the painted water; fall streams down it
     life     [x, y, 'smoke' | 'embers' | 'bees' | 'sparks' | 'fireflies']   little lives in the picture
     clouds   false to keep cloud shadows off a map (they drift over every map otherwise) */

const WARM = '#ffcf7a', CANDLE = '#ffb45a', MOON = '#bcd4ff', DAYLIGHT = '#fff3c8', BLUE_LAMP = '#9fd0ff';

const LIVING = {
  // ---------- rooms ----------
  'academy-gate': { sun: true,
    lights: [[960, 660, 110, WARM], [1720, 660, 110, WARM], [1290, 600, 160, DAYLIGHT]],
    water: [[180, 780, 720, 120, 'ripple'], [1800, 780, 660, 150, 'ripple']],
    life: [[1260, 300, 'fireflies']] },
  'dorm': {
    lights: [[1480, 575, 140, CANDLE], [900, 260, 260, MOON]],
    life: [] },
  'classroom': { sun: true,
    lights: [[2120, 575, 70, CANDLE], [2170, 590, 70, CANDLE], [180, 220, 110, WARM], [2010, 440, 90, WARM]],
    life: [[1290, 560, 'sparks']] },
  'cafeteria': { sun: true,
    lights: [[230, 570, 220, CANDLE], [660, 420, 80, WARM], [870, 400, 80, WARM], [1710, 330, 80, WARM], [780, 150, 120, WARM], [2320, 60, 120, WARM]],
    life: [[230, 520, 'embers']] },
  'library': { sun: true,
    lights: [[860, 80, 150, WARM], [2130, 800, 150, CANDLE], [1640, 380, 300, DAYLIGHT]],
    life: [[2130, 820, 'fireflies']] },
  'lair': {
    lights: [[626, 285, 180, CANDLE], [1674, 410, 150, CANDLE], [2530, 670, 130, CANDLE]],
    life: [[626, 260, 'embers'], [1300, 900, 'fireflies']] },
  'tunnel': {
    lights: [[340, 360, 220, CANDLE], [2420, 500, 420, DAYLIGHT]],
    life: [[1300, 760, 'fireflies'], [700, 900, 'fireflies']] },
  'woods-path': { sun: true,
    lights: [[2200, 200, 320, DAYLIGHT]],
    water: [[1960, 760, 600, 420, 'ripple'], [2300, 860, 60, 140, 'fall']],
    life: [[700, 700, 'fireflies'], [1500, 600, 'bees']] },
  'town-square': { sun: true,
    lights: [[2190, 480, 110, BLUE_LAMP], [60, 470, 90, WARM]],
    water: [[1080, 780, 320, 70, 'ripple'], [1200, 660, 120, 140, 'fall'], [1380, 650, 440, 90, 'ripple']],
    life: [[1220, 600, 'sparks']] },

  // ---------- maps ----------
  'map:school-grounds': {
    lights: [[1988, 1300, 110, WARM], [2620, 1380, 110, WARM], [2000, 1780, 110, WARM], [3380, 2180, 110, WARM], [1580, 2420, 110, WARM], [2120, 2420, 110, WARM], [1620, 1720, 110, WARM], [1900, 1000, 110, WARM], [3580, 600, 110, WARM], [3970, 600, 110, WARM]],
    water: [[3640, 420, 456, 1800, 'ripple'], [700, 1360, 200, 90, 'ripple'], [3800, 1520, 160, 160, 'fall']],
    life: [[2900, 1600, 'bees'], [600, 1500, 'bees']] },
  'map:whispering-woods': {
    lights: [[280, 100, 110, WARM], [540, 100, 110, WARM], [3232, 420, 110, CANDLE], [3652, 440, 110, CANDLE]],
    water: [[2480, 960, 1000, 520, 'ripple'], [2760, 1760, 300, 360, 'ripple'], [3220, 1300, 120, 180, 'fall']],
    life: [[600, 1700, 'fireflies'], [2000, 1200, 'fireflies'], [3400, 2400, 'fireflies'], [1400, 600, 'fireflies']] },
  'map:middlemarket': {
    lights: [[680, 1500, 110, WARM], [1340, 1440, 110, WARM], [1540, 1880, 110, WARM], [2480, 1780, 110, WARM], [2920, 1560, 110, WARM], [2560, 1300, 120, BLUE_LAMP], [3420, 1840, 110, WARM]],
    water: [[0, 280, 1840, 400, 'ripple'], [2240, 300, 1600, 520, 'ripple'], [2900, 340, 160, 160, 'fall'], [1880, 1440, 240, 100, 'ripple'], [1960, 1360, 80, 100, 'fall']],
    life: [[1420, 640, 'smoke'], [1880, 700, 'smoke'], [3600, 1560, 'bees']] },
  'map:petalvale-orchard': {
    lights: [[1240, 1300, 110, WARM], [2520, 1650, 110, WARM], [2800, 1200, 110, WARM], [1000, 880, 110, WARM]],
    water: [[400, 2640, 3200, 320, 'ripple'], [3860, 2700, 140, 140, 'fall']],
    life: [[2420, 360, 'embers'], [2200, 540, 'sparks'], [3360, 1560, 'bees'], [3480, 1640, 'bees'], [700, 1900, 'bees']] },
  'map:thunder-peak': {
    lights: [[1060, 1320, 110, WARM], [2460, 660, 110, WARM], [600, 2200, 110, WARM], [3000, 1240, 110, WARM]],
    water: [[520, 880, 180, 380, 'fall'], [3860, 1600, 80, 320, 'fall'], [3400, 1100, 60, 300, 'fall']],
    life: [[3540, 140, 'sparks'], [2800, 700, 'sparks'], [1600, 1300, 'sparks']] },
};

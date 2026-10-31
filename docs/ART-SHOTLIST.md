# Art shot list

What to buy or commission, in the order the game needs it. Every entry follows the contract in
`docs/ART-STYLE.md`: scenes are 2560 x 1440 in up to four layers (`sky`, `far`, `mid`, `near`),
characters are 400 x 600 paper dolls. Hotspot positions are given as percentages of the 2560 x
1440 canvas, left-to-right and top-to-bottom, so "door at 50%, 55%" means the middle of the door
is at x = 1280, y = 790. Walk paths are described in words; the exact line lives in
`data/scenes.js`. Everything is painted in neutral daylight; the game tints for time of day.

Buy the Epic 0.5 and Epic 1 scenes first (the gate, the dorm, the hallway) plus one hero, check
them in the game, then continue.

---

## A. Scenes

### Epic 0.5 and 1: arriving at school

**`academy-gate`: The Academy gate.** Needed first (title screen and the walk in).
- Layers: `sky` pale morning sky, the river valley, two distant kingdoms (warm stone to the left,
  green orchards to the right, a tower poking into the clouds in the middle). `far` the Academy's
  cream walls and rose-tiled roofs, the tall tower. `mid` the open gate with a blank sign board,
  flower beds, a lantern post either side. `near` a low hedge and a cobbled path edge.
- Mood: welcome, first day, a little grand. Palette: cream, rose, gold, sky blue.
- Hotspots: the gate (50%, 55%), the left lantern (30%, 50%), the right flower bed (72%, 68%).
- Walk path: along the cobbles from the bottom-left (10%, 88%) to the gate (50%, 80%) and on to
  the bottom-right (90%, 88%).

**`dorm`: The dormitory.** The day's start and end.
- Layers: `sky` the long room's far wall with three tall windows. `far` three beds in a row, each
  with a window above and a small chest. `mid` the beds' foot ends, a wardrobe, a door out, a
  rug. `near` a bedpost and the edge of a curtain.
- Mood: cozy, sleepy, safe. Palette: cream, rose, soft oak, quilts in warm colors (left bed warm,
  middle bed fresh pink and green, right bed violet and silver: the three girls' beds).
- Hotspots: bed one (22%, 62%), bed two (50%, 62%), bed three (78%, 62%), the wardrobe (10%, 50%),
  the door (92%, 48%).
- Walk path: a straight line across the room at 85% height, with a short branch up to each bed.

**`hallway`: The hallway.** Choosing where to go.
- Layers: `sky` a long corridor vanishing to a sunny window at the end. `far` portraits of old
  headmistresses (friendly faces, blank name plates), tall windows. `mid` four classroom doors
  (each with a blank sign board and a small symbol: a candle, an abacus, an owl, a paintbrush), a
  door to the cafeteria, a door to the library. `near` a bench and a potted plant.
- Mood: busy school morning. Palette: cream, gold, rose, oak.
- Hotspots: Spells door (15%, 50%), Numbers door (32%, 50%), Myths door (49%, 50%), Art door
  (66%, 50%), cafeteria door (82%, 50%), library door (95%, 50%), back to the dorm (3%, 60%).
- Walk path: straight along the corridor at 85% height.

### Epic 2: the first school day

**`classroom-spells`: Madame Cinder's classroom.**
- Layers: `sky` a stone wall with a big arched window. `far` shelves of bottles and books, a
  blackboard (blank), a fireplace. `mid` three desks with a candle on each, a cauldron on a
  stand, a windowsill of seedlings, Madame Cinder's desk, the door. `near` a desk corner.
- Mood: warm, a little smoky, magical. Palette: cream, gold, ember orange.
- Hotspots: desk one (25%, 64%), desk two (50%, 64%), desk three (75%, 64%), the cauldron
  (88%, 55%), the blackboard (50%, 30%), the door (5%, 50%).
- Walk path: along the front of the desks at 86% height.

**`cafeteria`: The cafeteria.** Lunch.
- Layers: `sky` a bright hall with a vaulted ceiling and bunting. `far` the serving counter with
  Cook's hatch and an ice cream cart, a big clock (blank face). `mid` six round tables with
  benches, each table a slightly different color. `near` a bench end and a dropped spoon.
- Mood: noisy, happy, delicious. Palette: cream, rose, gold, bunting in every color.
- Hotspots: tables one to six at (15%, 60%), (35%, 55%), (55%, 60%), (75%, 55%), (25%, 75%),
  (65%, 75%); Cook's hatch (88%, 38%); the ice cream cart (92%, 58%); the door (4%, 48%).
- Walk path: a loop between the tables at 80% to 88% height.

**`classroom-numbers`: Mr. Abacus's classroom.**
- Layers: `sky` a sunny wall. `far` a long number line painted on the wall (blank numbers:
  just tick marks), jars of beans on shelves. `mid` a pretend market stall with a striped awning,
  a coin tray, baskets of seeds, three desks, the door. `near` a basket of apples.
- Palette: cream, gold, green. Hotspots: the stall (60%, 55%), the number line (50%, 25%), the
  bean jars (85%, 45%), the desks (20%, 66%), the door (5%, 50%).

**`classroom-myths`: Professor Hoot's story corner (in the library).**
- Layers: `sky` tall bookcases to the ceiling. `far` a round window, a ladder, a hanging lamp.
  `mid` a big storybook on a stand, three floor cushions, Professor Hoot's perch. `near` a stack
  of books.
- Palette: oak, gold, rose, a deep green cushion. Hotspots: the storybook (50%, 50%), the perch
  (80%, 40%), cushions (25%, 72%), (50%, 76%), (75%, 72%).

**`art-room`: Miss Palette's art room.**
- Layers: `sky` a skylight. `far` paintings pinned on a wall (blank frames and simple shapes),
  shelves of jars. `mid` one long table with one big blank canvas in the middle, paint pots on
  the left (greys and blacks), the middle (pinks and greens), and the right (yellows and
  violets), an easel, the door. `near` a jar of brushes.
- Palette: cream with paint splashes of every color. Hotspots: the canvas (50%, 50%), left
  paints (20%, 62%), middle paints (50%, 68%), right paints (80%, 62%), the gallery wall
  (50%, 22%), the door (5%, 50%).

### Epic 3: the secret

**`library`: The library.** The way to the tunnel.
- Layers: `sky` the big room, a dome. `far` tall bookcases, a gallery with a railing, a round
  window. `mid` reading tables, Professor Hoot's desk, and, bottom left, one very dull bookcase
  with a bottom shelf that looks slightly wrong. `near` a globe and a chair back.
- Palette: oak, gold, cream, a dusty sunbeam. Hotspots: the bottom shelf (12%, 72%), Professor
  Hoot's desk (60%, 50%), the story corner (85%, 45%), the door (96%, 48%).

**`tunnel`: The tunnel.** A short scene, walked through.
- Layers: `sky` dark earth (warm brown, never black). `far` roots and stones, a row of tiny
  lamps along the wall (unlit; the game lights them). `mid` the tunnel's arch ahead and a few
  loose stones. `near` a root curling into the frame.
- Mood: secret, exciting, a tiny bit spooky in a fun way. Palette: earth browns, amber.
- Hotspots: the way ahead (85%, 55%), the way back (10%, 60%). Walk path: a gentle downhill
  line left to right.

**`lair`: The Lair.** Headquarters.
- Layers: `sky` a vaulted cellar ceiling. `far` stone walls, a hanging lantern, a gallery wall
  with blank frames, a shelf for scrolls. `mid` a treasure trunk, a corkboard, three cushions, a
  snack corner with a crate, a second tunnel mouth. `near` a cushion corner. Leave space: the
  upgrades (telescope, bookshelf, stuffie bed, radio) are separate small cut-outs placed by the
  game.
- Mood: the best place in the world. Palette: amber lantern light on earth brown, moss.
- Hotspots: the trunk (18%, 62%), the scroll shelf (38%, 35%), the case board (62%, 35%), the
  gallery wall (85%, 30%), the snack corner (90%, 65%), tunnel up to the library (5%, 50%),
  tunnel out to the woods (95%, 50%).
- Upgrade cut-outs (separate files, 600 x 600, transparent): `telescope`, `bookshelf`,
  `stuffie-bed`, `radio`, `cushions`, `lantern-fancy`, `secret-door`.

**`woods-path`: The woods path.** The first adventure.
- Layers: `sky` pale sky through leaves. `far` tall trunks, light shafts. `mid` a winding path, a
  fork with two ways (left and right), a mossy log, a chest half-hidden under ferns. `near`
  ferns and a branch.
- Palette: moss greens, bark, pale gold. Hotspots: left fork (25%, 45%), right fork (75%, 45%),
  the chest (60%, 70%), the log (40%, 72%), back (5%, 70%).

**`woods-clearing`: The clearing.** Spell duels happen here.
- Layers: `sky` open sky over the treetops. `far` a ring of trees. `mid` a round grassy clearing
  with a stump in the middle and a sparkle spot. `near` wildflowers.
- Palette: moss green, buttercup yellow. Hotspots: the stump (50%, 55%), the sparkle (78%, 65%),
  three exits (8%, 60%), (50%, 30%), (92%, 60%). The trouble is a separate cut-out placed by the
  game.

### Epic 4: the market

**`town-square`: Middlemarket square.**
- Layers: `sky` bright sky and the hills. `far` terracotta roofs, a clock tower (blank face),
  bunting. `mid` the bakery front with a window, the market entrance, Constable Pebble's tiny
  office door, the ice cream shop front, a fountain, a lamp post. `near` cobbles and a cart wheel.
- Palette: terracotta, sky blue, bunting. Hotspots: bakery (15%, 50%), market (38%, 50%),
  fountain (55%, 65%), Constable's office (72%, 50%), ice cream shop (90%, 50%), lamp post
  (62%, 45%), the woods path (3%, 70%).

**`market`: The market.**
- Layers: `sky` striped awnings. `far` stalls with blank sign boards. `mid` a gear stall (capes,
  crowns, wands on a rack), an art-supplies stall, a seed stall, a coin-counting counter. `near`
  a basket. Hotspots: gear (25%, 55%), supplies (50%, 55%), seeds (75%, 55%), counter (50%, 75%).

**`ice-cream-shop`: Cook's cousin's ice cream shop.**
- Layers: `sky` a pastel wall. `far` a menu board (blank), jars. `mid` a counter with a row of
  tubs (many colors), a bell, two small tables. `near` a napkin holder. Hotspots: the tubs
  (50%, 52%), the bell (70%, 48%), table (25%, 72%), table (80%, 72%).

### Epic 5: myths

**`persephone-gate`: Persephone's Gate.**
- Layers: `sky` split down the middle: spring on the left (pink blossom sky), winter on the right
  (pale blue). `far` blossoming trees left, bare snowy trees right. `mid` a tall stone gate
  exactly in the middle, a pomegranate tree, a frozen pond. `near` flowers left, snow right.
- Hotspots: the gate (50%, 50%), the tree (25%, 55%), the pond (75%, 68%).

**`torch-cave`: The Torch Cave.**
- Layers: `sky` warm charcoal rock. `far` crystals that catch light. `mid` a cave mouth, a stone
  bowl for a flame, a chest. `near` a rock edge. Palette: ember orange on charcoal, never black.
- Hotspots: the bowl (50%, 55%), the chest (78%, 68%), the mouth (10%, 55%).

### Epic 6 and 7

**`constable-office`: Constable Pebble's office.**
- Layers: `sky` a small room's wall with a window. `far` a wanted board (blank), filing cabinets,
  a hat stand. `mid` a desk with an enormous stack of paper, a drawer, a case board with pins. `near`
  a chair back. Palette: terracotta, oak, sky blue. Hotspots: the desk (50%, 58%), the case
  board (80%, 38%), the drawer (40%, 70%), the door (6%, 50%).

**`headmistress-office`: The Headmistress's office.** The Pure of Heart test.
- Layers: `sky` a round window. `far` shelves, a kettle, portraits. `mid` a big soft chair, a
  small chair, a table with two cocoa cups. `near` a rug edge. Mood: kind, a little serious.
  Hotspots: the chair (35%, 62%), the cocoa (55%, 66%), the door (92%, 50%).

### Epic 9

**`thunder-peak`: Thunder Peak.**
- Layers: `sky` indigo evening with silver clouds and a far-off flicker. `far` cloud banks and
  the tower of the Academy tiny below. `mid` a rocky summit, a lightning rod, a flat stone for
  standing on. `near` a wisp of cloud. Palette: indigo, silver, lilac, a yellow spark.
- Hotspots: the stone (50%, 58%), the rod (70%, 40%), the way down (8%, 72%).

### Epic 10 and after

**`festival-hill`: Festival Hill.**
- Layers: `sky` sunset over all three kingdoms. `far` tents and flags of three colors, crowds as
  friendly shapes. `mid` a big stage, a bonfire ring (unlit), flower garlands, a lightning rod
  decorated with ribbons. `near` a flag on a pole.
- Hotspots: the stage (50%, 50%), the bonfire (25%, 65%), the garlands (75%, 65%).

---

## B. Characters

### Heroes (paper dolls, layers `back`, `body`, `outfit`, `face`, `hair`, `head`, `hand`)

| Id | Who | Notes |
|---|---|---|
| `fire` | Fire Girl | warm colors; a flame-shaped hair tuft or ribbon; default `hand` is a twig wand; default `head` a small ember crown |
| `flower` | Flower Girl | fresh pinks and greens; petals in the hair; default `hand` a twig wand; default `head` a daisy crown |
| `electric` | Electric Girl | violet, yellow, silver; hair that stands up a little; default `hand` a twig wand; default `head` a tiny lightning-bolt pin |

Each hero also needs a `face` variant set: `face.png` (neutral), `face-happy.png`,
`face-surprised.png`, `face-sleepy.png`.

### Teachers and townsfolk (`art/npcs/<id>.png`)

| Id | Who | One line for the artist |
|---|---|---|
| `hoot` | Professor Hoot | a round owl with very small glasses, a book under one wing |
| `headmistress` | the Headmistress | tall, kind, keys on a ribbon, a cocoa cup |
| `cinder` | Madame Cinder | elegant, warm reds, a shawl, a candle |
| `abacus` | Mr. Abacus | a tortoise with spectacles and a tiny apron |
| `palette` | Miss Palette | paint on her nose, a smock, a brush |
| `cook` | Cook | big, cheerful, an ice cream scoop held like a sword |
| `pebble` | Constable Pebble | short, round, a too-big hat, a badge |
| `crumb` | Mrs. Crumb | a baker with a floury apron and a pie |
| `fern` | Old Fern | a gardener with a hat and a seed bag |
| `pip` | Pip | a small lamplighter with a very short ladder |

### Friends (`art/npcs/<id>.png`)

| Id | Who | One line |
|---|---|---|
| `ice` | the Ice princess | pale blue, neat braids, hugging a warm mug |
| `wind` | the Wind princess | hair blown sideways, mid-step, grinning |
| `stone` | the Stone princess | grey-green, sturdy, a pocket full of pebbles |
| `cloud` | the Cloud princess | fluffy white and lilac, drawing in the air |
| `shell` | the Shell princess | sea colors, a shell necklace, a strange snack |
| `moss` | the Moss princess | tiny, green, fierce, a mushroom on her hat |

### Troubles (`art/npcs/<id>.png`, round and silly, 600 x 600)

`weed` (a grumpy tuft with crossed leaves), `smoke` (a puff mid-sneeze), `frost` (a shivering
snowflake with mittens), `fog` (a sleepy cloud sitting down), `rock` (a bored boulder with eyebrows).

---

## C. Items and UI

- **Items sheet:** one 256 x 256 icon per item in `data/items.js` (wands, crowns, capes, boots,
  gems, seeds, scrolls, badges, ice creams), plus `outfit` / `head` / `hand` / `back` doll layers
  for every wearable.
- **UI frame sheet:** speech bubble (nine-slice: corners, edges, middle, and a tail), panel border
  (nine-slice), a big round button face in three states (up, down, glowing), a star (empty and
  full), a heart, a coin, a sparkle burst (three frames), a cloud icon for "live".
- **Particles:** small transparent PNGs, 64 x 64: ember, petal, spark, firefly, dust mote,
  snowflake, soot.

---

## D. Order to buy

1. `academy-gate`, `dorm`, `hallway`, the `fire` and `flower` dolls, the UI frame sheet
2. `classroom-spells`, `cafeteria`, `hoot`, `cinder`, `cook`, two friends
3. `library`, `tunnel`, `lair`, `woods-path`, `woods-clearing`, the troubles
4. `classroom-numbers`, `town-square`, `market`, `ice-cream-shop`, `abacus`, `pebble`, `crumb`,
   `fern`, `pip`, the items sheet
5. `classroom-myths`, `art-room`, `persephone-gate`, `torch-cave`, `palette`, the other friends
6. `constable-office`, `headmistress-office`, `headmistress`
7. `thunder-peak`, the `electric` doll, `festival-hill`

# Art style guide

For anyone making or buying art for Ember Bloom: an illustrator, a shop pack, or the girls with
crayons. The game is built so that art can arrive one scene at a time. Until a scene's real art
exists, a built-in cut-paper placeholder is shown. `docs/ART-SHOTLIST.md` lists what to buy.

---

## 1. The look in one paragraph

A **painted storybook** with a **cut-paper** feel: soft edges, layered shapes, gentle texture,
warm light. Think of a picture book you would read at bedtime, not a cartoon show and not a
video game. Everything is friendly and rounded. Nothing is sharp, dark, jagged or scary. Big
shapes read clearly from across a room, because the players are seven and the screen is a tablet
held between two of them.

## 2. Palettes by place

Each place has its own warm palette so a player always knows where she is without reading.

| Place | Palette | Light |
|---|---|---|
| **The Academy** (gate, dorm, hallway, classrooms, cafeteria, library) | cream, rose, gold, soft oak | warm daylight through tall windows; candle glow at night |
| **The Lair and tunnel** | amber lantern light on earth browns, a little moss | one warm lantern, deep cozy shadows (never black) |
| **The Woods** | moss greens, bark browns, light shafts of pale gold | dappled light; fireflies at dusk |
| **Middlemarket** (square, market, Constable's office, ice cream shop) | terracotta, sky blue, bunting in every color | bright open sky; lamps at evening |
| **Stormhaven and Thunder Peak** | indigo, silver, lilac, a flicker of yellow | moonlit cloud light with small sparks |
| **Myth places** (Persephone's Gate, Torch Cave) | the Woods palette shifted: Gate is half spring pink / half winter blue; the Cave is ember orange on charcoal | mysterious but never gloomy |

## 3. Rules

- **No scary shapes.** No pointed teeth, no glowing red eyes, no skulls, no sharp claws. The
  "troubles" (Grumpy Weed, Sneezy Smoke, Cold Snap) are round, sulky and a bit ridiculous.
- **Soft edges and simple texture.** Paper grain, watercolor bloom, or flat shapes with a soft
  shadow. No hard black outlines unless the whole style uses them consistently.
- **Readable silhouettes at tablet size.** The screen is about 12 inches across and shared by two
  players. A door, a chest, a person must be recognisable at a glance from a meter away.
- **Big clear hotspots.** Anything a player can tap (a door, a shelf, a person, a chest) should be
  large (at least 8% of the scene width), clearly a "thing", and not overlapping another tappable
  thing.
- **Leave the bottom third walkable.** Heroes stand and walk in the lower part of the scene (the
  `near` plane). Keep that band clear of tappable things except on its edges.
- **Day and night.** The engine tints scenes for morning, midday, afternoon and night, so paint in
  neutral daylight. Do not bake in a sunset.
- **No text in the art.** Signs, labels and names are drawn by the game so they can be read aloud
  and changed. A sign in a painting should be a blank board.
- **Three girls, three colors.** Fire Girl reads as warm (orange, gold), Flower Girl as fresh
  (pink, green), Electric Girl as bright (yellow, violet, silver). Skin tones and hair are chosen
  by the owner.

## 4. The file contract (exact)

The engine loads art by file name. Follow this exactly and a new scene works without any code
change.

### Scenes

- Logical size **2560 x 1440** pixels per layer. (Deliver at that size; the engine scales.)
- Up to four layers, back to front: `sky`, `far`, `mid`, `near`.
- Files: `art/scenes/<scene-id>/<layer>.png`. The placeholder versions are `.svg` with the same
  names; a `.png` takes priority over an `.svg` of the same layer.
- `sky` is opaque. `far`, `mid`, `near` have transparent backgrounds.
- Each layer is drawn 6% larger than the viewport and offset by the camera pan times a parallax
  factor: `sky` 0.1, `far` 0.3, `mid` 0.6, `near` 1.0. So paint each layer with about 3% of slack
  on each side (nothing important in the outer 3%).
- The walk path and the hotspots are **not** in the art. They are rectangles and lines in
  `data/scenes.js`. The visible door is painted in `mid`; the invisible tappable rectangle is in
  data. The shot list gives the approximate positions so the painting and the data agree.

What goes in each layer, as a rule of thumb:

| Layer | Contents |
|---|---|
| `sky` | sky, distant hills, the far wall of a room; the flat backdrop |
| `far` | background buildings, trees, bookcases, windows |
| `mid` | the things players tap: doors, tables, people's chairs, chests, the Constable's desk |
| `near` | foreground framing: a branch, a table edge, a pillar, grass tufts; nothing tappable |

### Heroes (paper dolls)

Each princess is drawn in layers so that gear can change her look.

- Folder: `art/heroes/<kind>/` where kind is `fire`, `flower` or `electric`.
- Layers back to front: `back` (cape, wings), `body` (skin, arms, legs, basic dress), `outfit`
  (clothes over the body), `face` (eyes, mouth, blush), `hair`, `head` (hat, crown, flower),
  `hand` (wand, item).
- One file per layer: `art/heroes/<kind>/<layer>.png` (placeholders `.svg`).
- Canvas **400 x 600**, feet on the bottom edge, facing right, transparent background. The engine
  mirrors her to face left.
- The engine animates by moving layers (idle bob, walk wobble, a cast pose that raises `hand`),
  so each layer must be a complete, separate cut-out: the `body` under the `outfit` is fully
  drawn, not just the visible parts.
- Items that change the look ship their own layer files under `art/items/<item-id>/<layer>.png`
  (for example `art/items/crown-ember/head.png`). Same 400 x 600 canvas, same alignment, so the
  crown sits on the head.

### NPCs

- `art/npcs/<npc-id>.png` (placeholders `.svg`), one flat cut-out each, **400 x 600**, feet on the
  bottom, facing right, transparent.
- Ids: `hoot`, `headmistress`, `cinder`, `abacus`, `palette`, `cook`, `pebble`, `crumb`, `fern`,
  `pip`, the six friends `ice`, `wind`, `stone`, `cloud`, `shell`, `moss`, and the troubles
  `weed`, `smoke`, `frost`, `fog`, `rock`.

### Size on screen

Heroes and NPCs are drawn at one third of scene height (**480 px** tall) at the near plane, so a
400 x 600 doll is scaled down by 0.8. Paint with that in mind: features big enough to read at
that size.

### Items and UI

- Item icons: `art/items/<item-id>/icon.png`, 256 x 256, transparent, a single clear object
  centered.
- The UI frame (speech-bubble corners, panel border, button face): one sheet, see the shot list.

## 5. What to ask an artist for

Copy this into a brief:

> A set of storybook scenes for a children's game, each delivered as separate layered PNGs
> (sky / far / mid / near) at 2560 x 1440 with transparent backgrounds on the front three layers,
> painted in neutral daylight, no text, with 3% of slack at the edges. Soft painted / cut-paper
> style, warm palette as listed, nothing scary, big readable shapes, the bottom third kept clear
> for walking characters. Plus three child princess characters as paper-doll layers (back, body,
> outfit, face, hair, head, hand) at 400 x 600, feet on the bottom, facing right. A license that
> allows the files to be published in a public open-source repository.

Start with one scene (the Academy gate) and one hero, check them in the game, then order the
rest in the shot-list order.

## 6. Licensing

The repository is public on GitHub, and GitHub Pages serves the files to anyone with the link.
That counts as **redistribution**. Two ways to stay honest:

1. **Buy a license that allows redistribution** (or commission work with that clause). Most
   commissions can include it; many shop packs cannot. Keep the license text in
   `art/LICENSES.md` next to the files.
2. **Keep purchased files out of the public repo**: put them in `art-private/` (which is in
   `.gitignore`) and copy them into `art/` only on the Surface itself. The tradeoff: the public
   web page shows placeholders, and the real art exists only on devices where someone copied it
   in. Install steps would go in `docs/SETUP.md`.

Option 1 is simpler and is what the shot list assumes. Free packs with a CC0 license (for
example, anything by Kenney) can be committed freely. Never commit a file whose license says
"no redistribution".

The girls' own drawings are the best art of all, and need no license.

# Pictures

Every picture in the game is a placeholder drawing (plain SVG) in this folder, in a consistent
cut-paper storybook style. They are good enough to play with. Real painted art can replace any
of them one file at a time, and the game picks it up with no code change.

## The rule for swapping

For any picture, drop a `.png` next to the `.svg` with the same name, then add its path (no extension) to
the list in `art/overrides.js`, for example `'art/scenes/lair/mid'`. The game then loads the `.png` and
ignores the placeholder. (The list exists so the game never asks for files that are not there.)

## Scenes: `art/scenes/<scene-id>/`

A scene is up to four layers, drawn back to front. Each layer is one picture of **2560 × 1440**.

| File | What it holds | Transparent? |
|---|---|---|
| `sky.svg` / `sky.png` | the sky or the back wall, fills the whole picture | no |
| `far.svg` / `far.png` | distant things: hills, far trees, the back wall's shelves and windows | yes |
| `mid.svg` / `mid.png` | the room or place itself: doors, furniture, buildings, the things you can tap | yes |
| `near.svg` / `near.png` | a few foreground framing bits at the edges: a leaf, a lantern post | yes |

Layers move slightly against each other when the camera pans, which is what makes it feel deep.

**The walking lane.** Heroes are about 480 px tall and walk along the bottom quarter of the
picture (their feet at roughly y = 1150 to 1350). Keep that strip clear of furniture in `mid`,
and keep `near` to the left and right edges so nothing covers a hero's face.

**No words in the pictures.** Signs are drawn as symbols (a pretzel, a blue lamp). The game puts
any words on top so they can be tapped and read aloud.

Scenes so far: `academy-gate`, `dorm`, `classroom`, `cafeteria`, `library`, `tunnel`, `lair`,
`woods-path`, `town-square`. The list of scenes to paint, with mood and must-haves, is in
`docs/ART-SHOTLIST.md`.

## Heroes: `art/heroes/<kind>/`

A hero is a paper doll: seven layers of **400 × 600**, transparent, standing, facing right, feet
on the bottom edge. The game stacks them in this order, so a new crown or cape is just a new
`head` or `back` picture:

```
back   (cape)
body   (skin: head, neck, arms, legs)
outfit (dress and boots)
face   (eyes, cheeks, smile only)
hair
head   (crown, flower crown, headband)
hand   (what she holds: a spark, a sprout, a bolt)
```

Kinds: `fire`, `flower`, `electric`. Items the girls can wear later get their own files under
`art/items/` using the same 400 × 600 frame.

## Townspeople and teachers: `art/npcs/<id>.svg`

One picture each, same **400 × 600** frame and the same cut-out style:
`hoot` (Professor Hoot), `cinder` (Madame Cinder), `abacus` (Mr. Abacus), `palette`
(Miss Palette), `cook`, `pebble` (Constable Pebble), `headmistress`, `princess-ice`.

## Adding purchased or commissioned art

1. Ask the artist for the layers as separate PNG files with transparent backgrounds, at the
   sizes above. Scenes: 2560 × 1440 per layer. People: 400 × 600.
2. Name the files exactly as in the tables (for a scene, `sky.png`, `far.png`, `mid.png`,
   `near.png`).
3. On GitHub, open the matching folder, **Add file → Upload files**, drag them in, **Commit**.
4. Open the game. If the new picture is covering the walking lane or hiding a tappable thing,
   tell Claude Code which scene and it will adjust the hotspots in `data/scenes.js`.

The girls' own drawings work too: photograph on white, remove the background (on an iPad: press
and hold the drawing in Photos, Share → Save Image), save as PNG, upload.

## Style guide (for anyone painting)

Cut-paper storybook: soft rounded shapes, gentle gradients, warm light, no outlines or thin ones.
Palettes: Academy rooms cream, rose, gold and warm wood; the Lair amber lantern light on earth
browns; the Woods moss greens with light shafts and a pale sky; the Town terracotta roofs under
sky blue; the Tunnel deep brown with a warm glow at the far end. Nothing scary, ever.

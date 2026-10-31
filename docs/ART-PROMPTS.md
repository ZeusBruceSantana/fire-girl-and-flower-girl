# Image generation brief for Ember Bloom

A prompt pack. Copy a prompt, generate, pick the best, save the file with the name given, add one line to
`art/overrides.js`, and the game uses it. Nothing else to do.

## 1. Before you start

**Tool: ChatGPT Plus.** Start one chat for scenes and one for characters. Paste the Style Lock as the
first message of each. For every image after the first, attach your favorite earlier image and say
"same style as this". Ask for the largest size and "landscape 16:9" for scenes, "portrait 2:3" for
characters. For characters ask for a **transparent background PNG**. If a result drifts flat or
cartoonish, reply "more painted texture, softer light, picture-book illustration" and regenerate.

**Settings that matter.**
- Scenes: aspect ratio **16:9**, as large as the tool allows, then upscale. Target 2560 x 1440. Anything from
  1920 x 1080 up is fine; the game scales it.
- Characters: aspect ratio **2:3** (portrait), target 1200 x 1800 or larger.
- Midjourney: add `--ar 16:9 --style raw --stylize 250` to scenes and `--ar 2:3` to characters. Once you have
  a scene you love, reuse its look with `--sref <that image's URL>` on every other scene. For characters use
  `--cref <character sheet URL>` so the same girl appears each time.
- ChatGPT: paste the Style Lock once at the top of the chat, then say "Same style as before" for each new
  scene. Attach your favorite scene as a reference. For characters, ask for a **transparent background PNG**;
  it can do that directly.

**Three rules for every scene.** The game needs them; say them in every prompt (they are already in the
prompts below).
1. **No people, no animals in the scene.** The princesses and townsfolk are drawn in by the game.
2. **The bottom quarter of the picture is open ground**: floor, path, grass, cobbles. That is where the
   girls walk. No furniture or walls across it.
3. **No text, no signs with letters, no watermark.** Signs can have pictures.

**What a "good one" looks like.** Painted texture you can see, warm light with a clear direction, depth
(things in front are crisper, things behind are softer), rich detail that stays readable at tablet size,
nothing scary, nothing busy in the middle of the floor. If a result looks like a flat vector cartoon, a
3D render, or a photo, discard it.

## 2. The Style Lock

Paste this at the start of every scene prompt (or once per chat in ChatGPT). It is what keeps 22 scenes
looking like one book.

> Painted children's storybook illustration, gouache and soft digital painting with visible textured
> brushwork, warm golden light with soft shadows, gentle atmospheric depth, cozy fantasy, rich detail that
> stays uncluttered, soft rounded shapes, friendly and inviting, in the spirit of classic picture-book art.
> Wide establishing shot. No people, no animals, no text, no lettering, no watermark. The bottom quarter of
> the image is open, flat, walkable ground.

Negative prompt (Midjourney `--no`, or "avoid:" in ChatGPT):
`people, children, animals, text, letters, signs with words, watermark, logo, photo, 3d render, vector,
flat cartoon, anime, dark, scary, cluttered foreground`

## 3. Scenes

Each scene: the file name, then the prompt. Prompts assume the Style Lock is pasted first. Positions like
"center" and "right third" are where the game puts doors and things to tap, so keep them.

Save every scene as **`art/scenes/<id>/full.png`** and add `'art/scenes/<id>/full'` to `art/overrides.js`.
(One painting per scene. The game adds a gentle camera drift for depth. If you ever want true parallax, the
layered version is described in `docs/ART-STYLE.md`, but it is not needed.)

### Generate these nine first (the game already uses them)

**academy-gate** · `art/scenes/academy-gate/full.png`
> A royal academy for young princesses: a storybook castle-school of cream stone with rose-tiled turrets
> and gold-trimmed windows, built on an island in a gentle river, a wide arched gate exactly in the center
> with warm light glowing inside it, a little stone bridge leading to the gate, colorful bunting strung
> between lanterns, morning sun, soft clouds, rolling green hills behind, flower beds at the lower left and
> lower right. The bottom quarter is a wide flat cobbled forecourt and grass.

**dorm** · `art/scenes/dorm/full.png`
> A cozy princess dormitory at night: three beds in a row along the back wall, each with a different quilt
> (left bed warm orange with ember patterns, middle bed soft green with petal patterns, right bed deep
> indigo with tiny silver lightning), a tall arched window in the center showing a crescent moon and
> stars, a wooden wardrobe on the far right, a lantern glowing on a bedside table, a braided rug, toys and
> books tucked under the beds, warm lamplight. The bottom quarter is clear polished wooden floor.

**classroom** · `art/scenes/classroom/full.png`
> A small magic classroom in a castle school: a large green chalkboard centered on the back wall with
> chalk swirls and a gold star (no letters), three small wooden desks in a row in the middle distance, a
> teacher's desk with a cauldron and candles on the right, tall arched windows with daylight, shelves of
> colorful potion bottles and books, a tall witch's hat on a hook, warm wooden floor. The bottom quarter
> is clear floor in front of the desks.

**cafeteria** · `art/scenes/cafeteria/full.png`
> A sunny castle dining hall for a small school: long wooden tables with benches along the left and
> center, a pink-and-cream ice cream cart with a striped awning and glass tubs of many colors on the
> right, tall arched windows with bunting, bowls of fruit, pies cooling on a sideboard, cheerful warm
> light, checkered tile floor. The bottom quarter is clear floor between the tables.

**library** · `art/scenes/library/full.png`
> A tall, cozy castle library in late afternoon light: floor-to-ceiling bookshelves packed with colorful
> books, a rolling ladder on the left, a round window in the center, a plump reading armchair with a
> cushion on the left, a long low shelf across the back, and on the far right a bottom shelf with one gap
> where a few books lean and a faint glow escapes (a secret door, subtle), dust motes in a sunbeam,
> oak floor. The bottom quarter is clear wooden floor.

**tunnel** · `art/scenes/tunnel/full.png`
> A secret underground tunnel dug by children: earthy brown walls with tree roots winding through them,
> a single hanging lantern on the left casting warm amber light, little mushrooms along the base, a soft
> warm glow at the far end on the right where the tunnel opens up, cozy not scary, deep brown shadows with
> amber highlights. The bottom quarter is a flat packed-earth floor.

**lair** · `art/scenes/lair/full.png`
> A secret headquarters in an old root cellar, made cozy by three girls: three big cushions (orange,
> green, indigo) around a low round table in the center, a cork board with pinned notes and red string on
> the right wall, a hand-drawn map on the left wall, a big glowing lantern hanging from the ceiling, a
> small bookshelf, a tin of biscuits and a jug on a crate, a wooden ladder going up on the far left, roots
> in the ceiling, warm amber light. The bottom quarter is a clear earthen floor with a round woven rug.

**woods-path** · `art/scenes/woods-path/full.png`
> A friendly enchanted forest path: a winding dirt path from the lower left to the right, big
> round-canopied trees with soft light shafts breaking through, moss and ferns, toadstools, a little
> stream with a wooden plank bridge on the right, wildflowers, a pale blue sky through the leaves,
> dappled golden light. The bottom quarter is the open path and grass.

**town-square** · `art/scenes/town-square/full.png`
> A storybook small-town square between two kingdoms: a stone fountain in the center, a bakery with a
> round window and terracotta roof on the left (a loaf of bread painted on its hanging sign, no letters),
> a small constable's office with a blue lamp on the right, colorful market stalls with awnings, bunting
> across the square, cobblestones, hills and a river in the distance, bright friendly daylight. The bottom
> quarter is open cobbles.

### The rest, by the epic that needs them

**hallway** · `art/scenes/hallway/full.png` (Epic 2)
> A castle school corridor with four arched doors along the back wall, each door a different color with a
> picture plaque (a flame, a flower, an owl, a paintbrush; no letters), stained-glass windows between them,
> a long runner rug, lanterns, morning light. The bottom quarter is clear stone floor.

**art-room** · `art/scenes/art-room/full.png` (Epic 6)
> A bright art studio in a castle school: a big easel with a blank canvas in the center, jars of brushes,
> pots of paint in every color, a charcoal stick and a dish of ash, a bowl of crushed pink petals, splashes
> of paint on the floor and apron hooks, a wide window with daylight, paintings pinned on the wall (no
> words). The bottom quarter is a clear paint-splattered floor.

**woods-clearing** · `art/scenes/woods-clearing/full.png` (Epic 3)
> A sunny forest clearing: a big old tree stump in the center like a little stage, a ring of wildflowers,
> an old wooden treasure chest half hidden in ferns on the right, a shimmer of sparkles near a hollow
> rock, tall trees around the edge, blue sky above. The bottom quarter is open grass.

**persephone-gate** · `art/scenes/persephone-gate/full.png` (Epic 5)
> An ancient stone gate standing alone in the forest, exactly centered: its left half covered in blooming
> flowers and vines, its right half warm and glowing with faint embers, a tree in spring on the left and a
> frosty pond on the right, pale light from behind the gate. The bottom quarter is open mossy ground.

**torch-cave** · `art/scenes/torch-cave/full.png` (Epic 5)
> The mouth of a friendly cave with old iron torch holders along the walls, all unlit but one glowing
> faintly on the right, a stone bowl in the center, a wooden chest at the back, warm rock colors, daylight
> entering from the left, not scary. The bottom quarter is a flat stone floor.

**thunder-peak** · `art/scenes/thunder-peak/full.png` (Epic 9)
> A mountaintop above the clouds: a flat rocky ledge, a big round standing stone in the center, a tall
> copper rod on the right with a few friendly sparks, soft purple-and-silver storm clouds below, a rainbow
> beginning on the left, indigo and silver with warm highlights. The bottom quarter is a flat stone ledge.

**market** · `art/scenes/market/full.png` (Epic 4)
> A covered market stall street in a storybook town: three stalls side by side (left: cloaks, boots and
> wands; center: paints and brushes; right: seeds and flowerpots), a counter in front, hanging lanterns,
> baskets, coins in a dish, warm striped awnings, afternoon light. The bottom quarter is open cobbles.

**ice-cream-shop** · `art/scenes/ice-cream-shop/full.png` (Epic 4)
> A small ice cream shop interior: a pink and cream counter with a row of glass tubs of ice cream in many
> colors in the center, a brass bell, cones stacked in jars, two small round tables with chairs at the
> sides, a window with a view of the square, cheerful pastel light. The bottom quarter is clear tile floor.

**constable-office** · `art/scenes/constable-office/full.png` (Epic 7)
> A tiny friendly constable's office in a small town: a big wooden desk piled high with papers in the
> center, a pin board of cases on the back wall (pictures, no words), a blue lamp, a coat stand with a
> blue cap, a kettle, a row of small badges in a glass case on the right, a window with the square
> outside, warm wood and sky-blue paint. The bottom quarter is clear floor in front of the desk.

**headmistress-office** · `art/scenes/headmistress-office/full.png` (Epic 8)
> A kind headmistress's study in a castle: a tall wingback chair by a fireplace on the left, a desk with a
> glowing crystal and an old book in the center, a tray with two cups of cocoa on the right, tall
> bookshelves, a round window with evening light, soft gold and deep green. The bottom quarter is a
> clear rug and floor.

**festival-hill** · `art/scenes/festival-hill/full.png` (Epic 10)
> A grassy hilltop at dusk set for a festival: a small wooden stage with garlands in the center, an unlit
> bonfire stack on the left, strings of paper lanterns and flower garlands on the right, two kingdoms
> visible far below (one warm and glowing, one green and blooming), a cloud castle faint in the sky,
> first stars. The bottom quarter is open grass.

**classroom-numbers**, **classroom-myths**, **classroom-spells** (optional, Epic 4 and 5)
> Only if you want each class to have its own room. Use the **classroom** prompt and change the middle:
> for Numbers, "an abacus, a number line of painted beads along the wall, a toy market stall, jars of
> coins"; for Myths, "a reading nook with cushions, an owl's perch, scrolls and a big open storybook on a
> stand, Greek vases"; for Spells, keep the cauldron and potion bottles. Save as
> `art/scenes/classroom-numbers/full.png` and so on.

## 4. Characters

Save as **`art/heroes/<kind>/full.png`** (kind = `fire`, `flower`, `electric`) and NPCs as
**`art/npcs/<id>.png`**, each with a **transparent background**, full figure, feet at the bottom.
Add `'art/heroes/fire/full'` (and so on) to `art/overrides.js`.

ChatGPT: ask for a transparent PNG. Midjourney: ask for "on a plain solid white background", then remove
the background with any free remover (remove.bg or Canva) and export PNG.

**Character Style Lock** (paste before each character prompt):
> Painted children's storybook character illustration, same gouache and soft digital painting style,
> full body, standing, three-quarter view facing to the right, feet visible, friendly open expression,
> age about seven, a princess who goes on adventures (boots, not slippers), soft rounded shapes, clean
> readable silhouette, no text, no watermark. Plain transparent background.

Make a **character sheet** first for each girl ("front, side, and back views of the same character") and
use it as the reference for every later image of her.

**fire** · `art/heroes/fire/full.png`
> Fire Girl, princess of a warm kingdom of lanterns and bakeries: a girl with warm brown skin and long
> dark brown hair with ember-gold tips that curl upward a little like a flame, a small gold tiara, a
> red-orange dress with ember-gold trim and a short flickering ember-colored cape, sturdy brown boots, a
> tiny spark of light floating above her open hand, brave and cheerful.

**flower** · `art/heroes/flower/full.png`
> Flower Girl, princess of a kingdom of meadows and orchards: a girl with warm brown skin and long dark
> brown hair in two braids with a crown of pink and white blossoms, a soft green dress with a petal-shaped
> hem and a petal cape, brown boots with a leaf on each, a sprouting seedling held gently in her hand,
> calm and kind. She and Fire Girl are sisters and should look alike, with different hair and dress.

**electric** · `art/heroes/electric/full.png`
> Electric Girl, princess of a kingdom in the clouds: a Hispanic girl with light olive-brown skin and
> long black hair, swept back and lifting a little as if charged, with one silver-blue lightning streak,
> a small silver crown, an indigo dress with silver trim and a fluffy white cloud-shaped cape, silver
> boots, a small friendly lightning bolt crackling in her hand, quick and funny.

**Optional expressions** for each hero, same prompt plus "happy and laughing", "surprised", "sleepy with
closed eyes": save as `art/heroes/<kind>/full-happy.png`, `full-surprised.png`, `full-sleepy.png`.

**Teachers and townsfolk** · `art/npcs/<id>.png`, same Character Style Lock but "a grown-up character":
- `hoot`: a wise, warm barn owl librarian wearing very small round glasses and a tiny scholar's sash,
  holding a scroll under one wing.
- `cinder`: Madame Cinder, the spells teacher, a tall kind woman with silver-streaked red hair under an
  enormous pointed hat that is taller than she is, a deep red robe with gold stars, a wand.
- `abacus`: Mr. Abacus, a gentle old tortoise teacher standing upright with spectacles and a green
  waistcoat, holding a small wooden abacus.
- `palette`: Miss Palette, the art teacher, a young woman with paint on her apron and a smudge on her
  nose, a bun held with two paintbrushes, holding a wooden palette.
- `cook`: Cook, a round, beaming woman in a white apron and cap holding a big ice cream scoop.
- `pebble`: Constable Pebble, a friendly woman with a sky-blue cap and coat, a gold badge, a notebook,
  slightly frazzled but kind.
- `headmistress`: the Headmistress, tall and graceful, silver hair in a crown braid, a deep green gown,
  a warm knowing smile, holding a small golden key.
- Townsfolk of Middlemarket (`art/npcs/<id>.png`): `baker` (Mrs. Crumb, round and rosy, flour on her
  apron, holding a loaf), `goatherd` (Nell, a freckled young woman with a crook and a small goat at her
  feet), `signpainter` (Mr. Tilt, lanky, paint-spattered overalls, a brush behind his ear, a crooked cap),
  `gardener` (Old Fern, white beard, straw hat, a watering can), `lamplighter` (Pip, small, a very short
  ladder under one arm, a lantern on a pole).
- Friends (older princesses, age about ten): `princess-ice` (pale blue gown, snowflake tiara, quiet),
  `princess-wind` (windswept hair, sky-blue scarf, mid-laugh), `princess-stone` (grey-brown braid, a
  pebble with a painted face in her hand), `princess-cloud` (fluffy white hair, dreamy, one shoe
  missing), `princess-shell` (seafoam gown, shell necklace, humming), `princess-moss` (green gown, a bee
  on her shoulder, arms crossed, secretly smiling).
- Troubles, round and silly, 1:1 aspect: `weed` (a grumpy tangle of leaves with a frown), `smoke` (a
  puff of grey smoke mid-sneeze), `frost` (a tiny shivering snowflake sprite), `static` (a fuzzy ball of
  static with hair standing on end).

## 5. Delivery checklist

1. Save each file with the exact name above. PNG for characters (transparency), PNG or JPG for scenes.
2. Add one line per file to `art/overrides.js`, path without the extension.
3. Put the files in the repo (GitHub web: open the folder, Add file, Upload files) or in Drive
   `to-code/art/` and I will add them.
4. Tell me which scenes are in. I tune the walk line and tap spots for each painting (a few minutes each).

**Licensing note.** Images you generate under a paid plan are yours to use in a public repository under
Midjourney's and OpenAI's current terms. If that ever changes, the files can move to a private folder.

## 6. Interface art (frames, icons, portraits)

Same chat as the characters. These make the menus look like part of the book.

**Parchment frame** · `art/ui/frame.png` (square, transparent background)
> A decorative frame for a fantasy storybook game menu: aged cream parchment panel with soft painted
> edges and a thin gold filigree border with small flame, flower and lightning motifs in the corners,
> the center completely empty and plain, square, transparent background outside the frame. Same painted
> storybook style.

**Name plate** · `art/ui/plate.png` (wide 4:1, transparent)
> A small decorative gold-and-parchment name plate banner for a storybook game, empty in the middle,
> transparent background.

**Menu icons** (one image with all eight, 1:1, transparent; I will cut them apart):
> Eight hand-painted storybook game icons in a 4 by 2 grid on a transparent background, each in a soft
> gold circle: an open spellbook with sparkles, a leather satchel, a quill and journal, a rolled map, a
> round badge with a star, two clasped hands for friends, a glowing ember flame, a pink heart. Same painted
> style, bold and readable at small size, no text.

**Portraits** · `art/heroes/<kind>/portrait.png` (1:1, transparent), one per princess:
> Head-and-shoulders portrait of [paste that princess's description], smiling at the viewer, same painted
> style, soft round vignette, transparent background.

## 7. Overworld maps (version 3)

Big top-down maps the girls walk across. Same style lock. Add to every map prompt:

> Top-down three-quarter bird's-eye view, like a painted storybook map or a cozy game world seen from
> above, wide paths clearly visible, no people, no animals, no text. 4:3, largest size.

**school-grounds** · `art/maps/school-grounds/full.png`
> The grounds of a royal academy for princesses seen from above: the cream castle-school with rose roofs
> at the top center, a gravel path from its front doors down to a gate in a garden wall at the bottom, a
> walled garden with flower beds and a fountain on the left, an orchard and a greenhouse on the right, a
> river curving along the right edge with a small bridge, a hidden gap in the wall at the lower right
> behind a bush, lanterns along the paths, morning light.

**whispering-woods** · `art/maps/whispering-woods/full.png`
> A friendly forest seen from above with one wide winding dirt path from the top left (a gap in a garden
> wall) to the bottom right (a view of a town's rooftops), clearings along the way, a stream with a
> plank bridge, a hollow tree stump, mossy rocks, toadstool rings, a small cave mouth in a rocky bank,
> dappled golden light through the canopy; the path and clearings must be clearly walkable and open.

**middlemarket** · `art/maps/middlemarket/full.png`
> A storybook small town seen from above: a central square with a fountain, a bakery with a round window,
> a small constable's office with a blue lamp, a market street of striped stalls, an ice cream shop, a
> town clock tower, cobbled streets wide and clear, a river and a stone bridge at the top edge leading to
> woods, hills at the bottom, bunting between lanterns, bright daylight.

**Troubles** · `art/troubles/<id>.png` (1:1, transparent, round and silly, no text): `grumpy-weed` (a
grumpy tangle of leaves with a frown), `sneezy-smoke` (a puff of grey smoke mid-sneeze), `cold-snap` (a
tiny shivering snowflake sprite with mittens), `static-sprite` (a fuzzy ball of static with hair standing
on end). Also `grumpy-weed-boss` and `sneezy-smoke-boss`: the same, twice as big and sillier.

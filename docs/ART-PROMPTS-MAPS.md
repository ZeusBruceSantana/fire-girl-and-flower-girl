# Image prompts: the five overworld maps

**For:** the owner · **Date:** 2026-10-31 · **Goes with:** `docs/ART-PROMPTS.md` (the Style Lock in section 2 is pasted
first, as for the scenes). This replaces section 7 of that file with the full layout of each map, so the painting and
the game's walk paths agree. The scenes and the three princesses are done; these five maps are what the game needs next.

## Before you start

- **Shape and size:** landscape **4:3**, as large as the tool allows, then upscale. Target **4096 x 3072**. Anything from
  2048 x 1536 up works; the game scales it.
- **View:** a painted storybook map seen from above at a tilt (three-quarter bird's-eye), the way a cozy game world or
  a picture-book treasure map is drawn. Buildings and trees show their fronts and roofs; paths are wide bands of
  lighter ground. Not a flat top-down plan, not a photo of a model.
- **Paths are the game.** The girls walk only on the paths and plazas. Paint them clearly: wide, light, open, with
  nothing standing on them. Where this brief says "a path from A to B", that band must be visible and empty.
- **Edges that lead somewhere** (a gate, a bridge, a road leaving the picture) must touch the edge of the image where
  the brief says, because the party arrives from and leaves by that spot.
- **No people, no animals, no text, no lettering.** The princesses, the townsfolk and the troubles are drawn in by the
  game. Signposts are blank boards. Shops show what they are by their shape (a round bread window, a striped stall).
- **Neutral daylight** unless the brief says otherwise; the game tints morning, evening and night.
- **3% slack** at every edge: nothing important in the outer 3%.
- Save each as **`art/maps/<id>/full.png`** (or .jpg) and add `'art/maps/<id>/full'` to `art/overrides.js`. Then run
  `node tools/make-manifest.js` (or tell Claude Code) so the offline list includes it. I then tune the walk rectangles
  and tap spots to the painting (a few minutes per map).

**Map Style Lock** (paste after the Style Lock from `docs/ART-PROMPTS.md`, once per chat):

> A painted storybook overworld map seen from above at a gentle tilt, like a cozy game world or a picture-book map,
> gouache texture, warm light, soft shadows, rounded friendly shapes, rich but uncluttered detail that reads at
> tablet size. Wide light-coloured paths and open plazas clearly visible and empty. No people, no animals, no text,
> no lettering, no watermark. Landscape 4:3.

Negative prompt: `people, children, animals, text, letters, signs with words, watermark, logo, photo, 3d render,
isometric pixel art, flat vector, dark, scary, paths blocked by objects`

Positions below use a 3 by 3 grid of the picture: top / middle / bottom and left / centre / right.

---

## 1. The school grounds · `art/maps/school-grounds/full.png`

The map a child sees first. Morning light. Cream castle-school with rose roofs across the **top centre**, its front
doors at the top-centre edge of the walkable area.

> The grounds of a royal academy for princesses: a cream stone castle-school with rose-pink roofs and a tall tower
> along the top centre, its big front doors facing down. A wide gravel path runs straight from the front doors down
> the centre of the picture to an iron gate in a garden wall at the bottom centre edge. The garden wall runs along the
> whole bottom edge and up the right side. A third of the way down, a side path leaves the main path to the right,
> across a lawn, to a glass greenhouse with an old wooden chest beside it in the middle-right; a Grumpy Weed could
> live on that lawn. Halfway down, a side path leaves to the left into a walled flower garden with a round stone
> fountain and flower beds in the middle-left, where an old gardener's tool shed stands; a blank wooden signpost at
> that junction. Near the bottom, a third side path runs right along the inside of the wall to the far lower-right
> corner, where a bush hides a crumbling gap in the wall right at the corner. A small cobbled plaza to the left of the
> gate. A river curves along the right edge beyond the wall with a little stone bridge. Lanterns on posts along every
> path, rose bushes, a few apple trees on the right. Morning light, dew.

The game needs: doors top centre; gate bottom centre; the gap in the wall at the lower-right corner (that is the
secret way to the woods); the fountain middle-left; the greenhouse and chest middle-right.

## 2. The Whispering Woods · `art/maps/whispering-woods/full.png`

One winding path with clearings. Dappled gold light. The woods are friendly, never dark.

> A friendly forest seen from above. The path enters at the top-left corner through a gap in a garden wall, runs
> right a short way along the top, then turns down, then right across the middle-left, then down the middle of the
> picture. From that middle stretch a side path curls down-left into a mossy clearing in the lower-left with a big
> hollow tree stump and toadstool rings. From the clearing the path runs right across the lower middle of the
> picture to a sunny glade with a stream and a plank bridge in the middle-right, then down the right side to a wide
> clearing in the bottom-right corner where the path leaves the right edge toward the rooftops and chimneys of a town
> just visible beyond the trees. A short spur at the top-right leads to a small dark cave mouth in a rocky bank with
> old torch holders beside it. A blank signpost near the entrance. Mossy rocks, ferns, fallen logs, shafts of golden
> light through the canopy, fireflies in the shadows. Every path and clearing wide, light and open.

The game needs: entrance top-left corner; the town exit on the right edge near the bottom; the cave mouth top-right;
the stump clearing lower-left; the glade middle-right.

## 3. Middlemarket · `art/maps/middlemarket/full.png`

The town. Bright daylight, bunting, terracotta and sky blue. Everyone shops here.

> A storybook small town seen from above. A stone bridge over a river at the top-centre edge leads south down a
> cobbled street into a large central square with a round fountain in its middle. Beside that street, just above the
> square, a clock tower with a ladder leaning on it. On the west side of the square, a bakery with a big round window
> and a chimney with curls of smoke, its door facing the square. On the east side of the square, a small constable's
> office with a blue lamp over the door. From the square's lower-right corner a street runs east to a market quarter in
> the middle-right with striped stalls, crates of apples and a goat pen with an open gate, and a road leaves the right
> edge toward orchards. From the square's lower-left corner a street runs west to an ice cream cart with a striped
> awning by a little green in the lower-left. Bunting between lanterns, flower boxes, rooftops of terracotta tiles,
> green hills along the bottom edge. Streets and the square wide, clear and empty.

The game needs: the bridge at the top-centre edge (to the woods); the square in the centre; the bakery west of it;
the constable's office east of it; the market quarter middle-right with the road leaving the right edge (to the
orchard); the ice cream cart lower-left.

## 4. Petalvale Orchard · `art/maps/petalvale-orchard/full.png`

Sunny, tidy rows of apple trees, bees. The ancient gate at the top is half spring and half scorched: the Persephone
story in one picture.

> A sunny apple orchard seen from above. A wooden fence with an open gate at the middle of the left edge is the way
> in; a lane runs right from it, with a blank signpost. From that lane a path turns north up the left-centre of the
> picture to a lane along the top, which leads to an ancient stone gate at the top centre: the left half of the gate
> covered in blooming vines and spring flowers, the right half scorched warm stone with faint embers and a patch of
> frost on the ground before it. The main lane continues right across the middle of the picture to a long straight
> north-south lane down the centre-right between the tree rows. Along the bottom, a lane runs right from that lane
> past one enormous apple tree in the bottom centre with an old chest under it, to a sunny clearing in the
> middle-right with beehives, from which a rocky footpath leaves the right edge climbing toward a mountain. Tidy rows
> of round apple trees with red apples, a stream along the very bottom edge, bees, wildflowers. Lanes wide, light and
> open.

The game needs: entrance middle of the left edge; the stone gate top centre; the big tree and chest bottom centre;
the clearing middle-right with the path to Thunder Peak leaving the right edge.

## 5. Thunder Peak · `art/maps/thunder-peak/full.png`

Electric Girl's mountain. Indigo, silver and lilac with warm gold highlights; a little later in the day than the
others. The path climbs in zigzags from the bottom-left to the summit at the top-right.

> A mountain path seen from above, climbing through banks of soft clouds. The path starts at the middle of the left
> edge near the bottom-left corner as a wide rock ledge, runs right along the bottom, then turns up the left-centre of
> the picture, then right across the middle, then up the centre-right, then right again across the upper middle, then
> up to a rocky summit in the top-right corner. Beside the first climb, a fluffy cloud shelf in the lower-middle with
> an old chest resting on the cloud. On the summit a copper lightning rod and a round standing stone with a carved
> spiral. A rainbow begins at the top-left corner and arcs behind the peak. Small sparks and fireflies of static
> light along the upper ledges, a blank signpost by the first climb, lilac and indigo rock, silver cloud, warm gold
> light on the summit. Ledges wide, flat and clearly walkable.

The game needs: the start at the left edge near the bottom; the zigzag with four turns; the cloud shelf lower-middle;
the summit top-right.

---

## The troubles that roam the maps (if not done yet)

`art/troubles/<id>.png`, 1:1, transparent, round and silly, no text, same character chat and style as the princesses:
`grumpy-weed` (a grumpy tangle of leaves with a frown), `sneezy-smoke` (a puff of grey smoke mid-sneeze), `cold-snap`
(a tiny shivering snowflake sprite with mittens), `static-sprite` (a fuzzy ball of static with hair standing on end),
and `grumpy-weed-boss`, `sneezy-smoke-boss`, `cold-snap-boss`, `static-sprite-boss`: the same, twice as big and sillier.

## Coming later (not needed now)

The three stuffie sidekicks (a dog, a snow leopard, a dragon) once their powers are designed; Festival Hill and the
Torch Cave as the story grows; the Lair's cozy bits (bunting, rugs, lamp shades) as small transparent cut-outs.

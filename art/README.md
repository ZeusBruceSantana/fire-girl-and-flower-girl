# Pictures

Right now every picture is a small built-in drawing (plain SVG) in `data/world.js` under `ART`.
That is enough to build and test the game. Real art can replace any picture one at a time.

## How to swap in a picture

1. Make a **square PNG with a see-through background** (the subject fills most of the square,
   feet at the bottom edge). On an iPad or iPhone: open the photo in Photos, press and hold the
   subject until it glows, then Share → Save Image.
2. Name it with the picture's id, for example `fireGirl.png`, `flowerGirl.png`, `owl.png`.
3. On GitHub, open this `art` folder, **Add file → Upload files**, drag it in, **Commit changes**.
4. Tell Claude Code "use art/fireGirl.png for the fireGirl picture" (a one-line change in `data/world.js`).

The girls' own drawings of Fire Girl and Flower Girl would be perfect here.

## Picture ids the game uses

| Id | Where it shows |
|---|---|
| `fireGirl`, `flowerGirl` | the heroes |
| `owl` | Professor Hoot, the helper |
| `coin` | money everywhere |
| `wand`, `crown`, `cape`, `boots`, `gem`, `seed`, `book` | items (see `data/items.js`) |
| `town`, `school`, `orchard`, `lane`, `pond`, `hill` | map tiles (see `data/areas.js`) |
| `baker`, `gardener`, `lamplighter` | townspeople |
| `weed`, `smoke`, `frost` | the silly troubles |
| picture words like `cat`, `ship`, `frog` | the "Word to picture" challenge (see `data/starter-words.js`) |

Ids that have no drawing yet fall back to a plain colored shape with the word on it, so the game
never breaks when a picture is missing.

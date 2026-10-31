# The game's content lives here

Everything the players see or collect is data in this folder, not code. Change the wording,
add an item, add a quest: edit these files (or ask Claude Code to). The `js/` folder only
knows *how* to show a quest or an item, never *which* ones exist.

| File | What's in it | Safe to change? |
|---|---|---|
| `world.js` | Names: the game, the two princesses, their spells, the kingdoms, the school, the helper, the town, townspeople, silly troubles. Side colors. Placeholder pictures. | Yes. Keep the `id`s (like `fire`, `flower`) as they are. |
| `items.js` | Every item, its rarity, price, sell price, which slot it is worn in, and the sets. | Yes. Add new items freely. Never rename or delete an `id` the girls may already own; add a new item instead. |
| `areas.js` | The map: areas, the level that unlocks each one, which quests and items are there. | Yes. Same rule about `id`s. |
| `quests.js` | Each quest's story steps, which challenge each step uses, and the reward. | Yes. Same rule about `id`s. |
| `challenges.js` | The four ways to answer (hear-and-pick, picture-match, letter-tiles, read-to-grown-up), their hints and rewards, and the adaptive-repetition odds. | Yes, carefully: these tune the learning. |
| `starter-words.js` | A built-in word list used only until a grown-up types the real one in the parent screen. | Yes. |

## Why plain `.js` files and not `.json`

The game runs straight from files on GitHub Pages and, once installed, offline from the tablet's
own copy. A `.js` file that sets one variable (`const ITEMS = [...]`) loads with a plain
`<script>` tag everywhere, with no fetching, no build step and no browser security complaints.
A `.json` file would need to be fetched, which does not work when the page is opened as a file.

## Rules for every file

- **No real names, school names or family details.** The girls' names are typed inside the game
  and stay on the device.
- Every visible string gets a `word` field so the game can show it and read it aloud.
- Keep words short. The players are 7 and learning to read.
- Each `id` is a short lowercase name with dashes (`wand-twig`). Once it is in a saved game, it stays.
- Losing is soft. Nothing in here should take anything away from a player.

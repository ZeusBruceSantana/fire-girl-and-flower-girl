# Ember Bloom

The adventures of Fire Girl and Flower Girl. An educational adventure for two 7-year-old sisters (and one day their cousin), played side by side
on one touch screen or on their own devices. Three princesses at a royal magic boarding school
sneak out through a secret tunnel to help a small town. Reading, math, myths and art are the magic.

- **Fire Girl**, princess of Emberfall. Her magic is light and heat.
- **Flower Girl**, princess of Petalvale. Her magic is growing and calming.
- **Electric Girl**, princess of Stormhaven in the clouds. Her magic is sparks and storms.
- Fire burns flowers, so two kingdoms kept apart for a hundred years. But petals hold cool dew and
  a vine can wrap a flame until it sleeps, and lightning helps both while needing both to calm it.
  The Academy sat all three at the same desk, and they have been best friends ever since.

**Reading is the magic.** Words are how you cast spells, open chests, read maps and talk to
townspeople. Each sister practices her own school words. Getting a word right makes sparkles,
coins and power. Getting it wrong gives a hint and another try, never a loss.

## Status

**Epic 3 (version 3).** A school day with Spells and Numbers classes, lunch with friends, an overworld
to explore with the party in a line, roaming troubles and turn-based battles powered by reading and
math. The art on screen is placeholder until the painted scenes, maps and characters arrive. See
[`docs/STATUS.md`](docs/STATUS.md) for what's next, [`docs/GAME-DESIGN.md`](docs/GAME-DESIGN.md)
for the full design and [`docs/ART-PROMPTS.md`](docs/ART-PROMPTS.md) for how the art is made.

## How it's built

A few plain files: `index.html`, `styles.css`, the `js` folder for how things work and the `data`
folder for what exists (heroes, items, quests, areas, words). No build step, no accounts, no
servers, no ads, no purchases. It runs on GitHub Pages, installs on the home screen like an app,
and works offline once opened. Progress saves on the device.

- `data/` is where the game's content lives. See [`data/README.md`](data/README.md).
- `docs/` has the plan, the story bible, setup steps for grown-ups, and decisions.
- `tests/` checks that saving, loading and the content files still work.

## For grown-ups

Setup steps (turning on the web page, installing on the tablet) are in
[`docs/SETUP.md`](docs/SETUP.md). The girls' names and school words are typed inside the game and
stay on the device. Nothing about the family is in this repository.

## Running the tests

Open `tests/index.html` from a local web server and press **Run the tests**, or from a terminal:

```bash
npm install --no-save playwright@1
npx playwright install chromium
node tests/run-in-ci.js
```

GitHub runs the same tests on every change (see `.github/workflows/tests.yml`).

## Credits

Built with Claude Code for two very good readers. The pet game that came before it is
[Twin Pets](https://github.com/ZeusBruceSantana/twin-pets). MIT licensed.

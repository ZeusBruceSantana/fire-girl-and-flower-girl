# Fire Girl and Flower Girl

A two-player reading adventure for two 7-year-old sisters, played side by side on one touch
screen (a Microsoft Surface or an iPad). Two princesses from kingdoms that never mix, one magic
school, and a town that always needs a little help.

- **Fire Girl**, princess of Emberfall. Her magic is light and heat.
- **Flower Girl**, princess of Petalvale. Her magic is growing and calming.
- Fire burns flowers, so the kingdoms kept apart for a hundred years. But petals hold cool dew and
  a vine can wrap a flame until it sleeps. The school's sorting hat sat them at the same desk, and
  they have been best friends ever since.

**Reading is the magic.** Words are how you cast spells, open chests, read maps and talk to
townspeople. Each sister practices her own school words. Getting a word right makes sparkles,
coins and power. Getting it wrong gives a hint and another try, never a loss.

## Status

**Epic 0 (Discovery).** This repo holds the plan, the content data files and a placeholder title
screen. There is no playable game yet. See [`docs/STATUS.md`](docs/STATUS.md) for what's next and
[`docs/DISCOVERY.md`](docs/DISCOVERY.md) for the full design.

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

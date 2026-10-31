# Decisions

Short log of choices that shape the project, newest first. One line of context, one line of
decision, so a future session does not reopen them without reason.

## 2026-10-31, version 3

- **Pokémon-style core.** After playing the storybook version the owner found it a point-and-click with
  quizzes. The core interaction model changed: overworld maps you explore by tapping, roaming troubles,
  a turn-based battle screen with moves powered by reading and math, the Giggle meter, the elemental
  triangle. The storybook scenes stay as interiors and battle backdrops, so the paintings are all used.
- **Parallel lanes.** Independent work (battle screen, Numbers class, art) runs in forked sessions, each
  in its own files, with the page pre-wired so nothing collides.

## 2026-10-31, the big version

- **Go big.** A real RPG, not a small word game: school day loop, three heroes, lair, cases, myths,
  math and logic puzzles. Full design in `GAME-DESIGN.md`; this supersedes `DISCOVERY-v1.md`.
- **Look: painted storybook scenes.** Not pixel art, not vector cartoon. Claude cannot generate
  images, so real art comes from an image generator run by the owner (brief: `ART-PROMPTS.md`) or
  from an artist. Vector placeholders exist only for building and testing and never ship to the
  girls as the final look.
- **One painting per scene, one painted figure per hero.** Simpler to generate than layered
  parallax art; the engine adds a gentle camera drift. Layered art remains possible (`ART-STYLE.md`).
- **Three seats: left, right, away.** Each twin and the cousin own a seat. Which seats a device shows
  is a setting, so the Surface shows two and a phone shows one. The twins will eventually play on
  separate devices; that needs the relay below, same as the cousin.
- **Action log with merge rules.** Every saved change is an action through a pure reducer; shared
  lists stay sorted, flags only turn on, counters only go up. Any order of the same actions gives the
  same world. This is what makes offline-now and live-later the same code.
- **Companion drives absent heroes.** On the host only, with a safe allowlist; earns and spends
  nothing for the absent player.
- **Live co-play relay: Cloudflare Workers + Durable Objects** (Epic 10), chosen for reliability
  through home routers and no inactivity pause; the owner creates the account. Trystero only as an
  experiment; Firebase as plan B.
- **Cousin E is Electric Girl**, an NPC classmate until she joins. Her link is the family world code
  plus her seat. No accounts, no names.
- **Greek myths** live in a Myths class and seed echo adventures; gods are not characters.
- **Town cases** are gentle mysteries for an overwhelmed Constable; Junior Helper badges.
- **The Academy never expels**: the Pure of Heart test instead.
- **Art budget:** owner pays per scene. Cheapest quality path: one month of ChatGPT Plus.

## 2026-10-31, Epic 0

- **The game is called Ember Bloom.** Owner's choice, named after the together magic. The repo keeps
  its original name; the save key is `ember-bloom-save-v1`.
- **New repo, not the "existing" one.** The brief referred to an existing reading RPG repo; none
  existed. Started fresh at `ZeusBruceSantana/fire-girl-and-flower-girl`, public so GitHub Pages
  is free.
- **Stack: plain HTML/CSS/JS, no build, no framework.** Proven by Twin Pets on the same device
  with the same players. Readable and editable by a newer coder.
- **Content is data in `data/*.js`.** Not JSON, so files load offline with a plain script tag.
  Ids are permanent once they can be in a save.
- **Word lists are never committed.** Typed by a parent in the game, stored on the device.
- **Tap-based answer checking only.** No speech recognition. "Read it to a grown-up" is an
  optional mode a parent turns on.
- **The target word is never spoken before the first try.** Otherwise reading becomes listening.
- **Role labels only** in the repo: Twin A (purple), Twin B (pink), a grown-up.
- **MIT license** added. Easy to remove if the owner prefers none.

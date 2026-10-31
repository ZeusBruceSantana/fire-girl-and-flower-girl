# Decisions

Short log of choices that shape the project, newest first. One line of context, one line of
decision, so a future session does not reopen them without reason.

## 2026-10-31

- **New repo, not the "existing" one.** The brief referred to an existing reading RPG repo; none
  existed. Started fresh at `ZeusBruceSantana/fire-girl-and-flower-girl`, public so GitHub Pages
  is free.
- **Theme is settled.** Fire Girl and Flower Girl, two kingdoms, magic school, best friends,
  helping the town. The brief's §7 interview questions that remain open have defaults in
  `data/world.js` (see DISCOVERY.md §8).
- **Stack: plain HTML/CSS/JS, no build, no framework.** Proven by Twin Pets on the same device
  with the same players. Readable and editable by a newer coder.
- **Content is data in `data/*.js`.** Not JSON, so files load offline with a plain script tag.
  Ids are permanent once they can be in a save.
- **Word lists are never committed.** Typed by a parent in the game, stored on the device.
- **One save object, two heroes, a shared world.** Areas unlock by the higher hero's level.
  Separate wallets by default.
- **Tap-based answer checking only.** No speech recognition. "Read it to a grown-up" is an
  optional mode a parent turns on.
- **The target word is never spoken before the first try.** Otherwise reading becomes listening.
- **Fire/flower balance:** flower's Dew puts out fire; vines smother it. Together they make
  Ember-Bloom magic, which needs both players to tap at once.
- **Role labels only** in the repo: Twin A (purple), Twin B (pink), a grown-up.
- **MIT license** added. Easy to remove if the owner prefers none.
- **Epic 0 ships a placeholder title screen**, not zero code, so Pages, offline, saving and the
  tests are proven before Epic 1.
